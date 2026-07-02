import {
  Injectable, NotFoundException,
  ForbiddenException, BadRequestException,
} from '@nestjs/common'
import * as QRCode from 'qrcode'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBookingDto } from './dto/create-booking.dto'
import { MailService } from '../mail/mail.service'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma:   PrismaService,
    private readonly mail:     MailService,
    private readonly events:   EventEmitter2,
  ) {}

  async create(dto: CreateBookingDto, userId?: string) {
    const [service, professional, branch] = await Promise.all([
      this.prisma.service.findUnique({ where: { id: dto.serviceId } }),
      this.prisma.professional.findUnique({
        where: { id: dto.professionalId },
        include: { services: { select: { id: true } }, user: true },
      }),
      dto.branchId
        ? this.prisma.branch.findUnique({ where: { id: dto.branchId } })
        : this.prisma.branch.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    ])

    if (!service?.isActive) throw new BadRequestException('Selected service is not available')
    if (!professional?.user?.isActive) throw new BadRequestException('Selected professional is not available')
    if (
      professional.services.length > 0 &&
      !professional.services.some(s => s.id === dto.serviceId)
    ) {
      throw new BadRequestException('Selected professional does not offer this service')
    }
    this.assertWithinWorkingHours(dto.date, dto.time, service.duration, branch?.openingHours)

    /* Check for conflicts */
    const conflict = await this.prisma.booking.findFirst({
      where: {
        professionalId: dto.professionalId,
        date:           dto.date,
        time:           dto.time,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })
    if (conflict) throw new BadRequestException('This time slot is already booked')

    const booking = await this.prisma.booking.create({
      data: {
        serviceId:      dto.serviceId,
        professionalId: dto.professionalId,
        customerId:     userId ?? null,
        guestName:      dto.fullName,
        guestEmail:     dto.email,
        guestPhone:     dto.phone,
        date:           dto.date,
        time:           dto.time,
        notes:          dto.notes,
        status:         'CONFIRMED',
        branchId:       dto.branchId ?? branch?.id ?? null,
        durationMins:   service.duration,
        totalAmount:    service.price,
      },
      include: {
        service:      true,
        professional: { include: { user: true } },
      },
    })

    // Emit event for notifications
    this.events.emit('booking.created', booking)

    // Send confirmation email (non-blocking)
    this.mail.sendBookingConfirmation(booking).catch(() => {})

    return booking
  }

  async findAll(
    currentUser: { id: string; role: string },
    filters: { status?: string; date?: string; page: number; limit: number },
  ) {
    const { status, date, page, limit } = filters
    const skip = (page - 1) * limit

    const where: any = {}

    if (currentUser.role === 'BARBER') {
      where.professionalId = await this.getProfessionalId(currentUser.id)
    } else if (currentUser.role === 'CUSTOMER') {
      where.customerId = currentUser.id
    }

    if (status) where.status = status
    if (date)   where.date   = date

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
        include: {
          service:      { select: { name: true, price: true, duration: true } },
          customer:     { select: { fullName: true, email: true, phone: true } },
          professional: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        },
      }),
      this.prisma.booking.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getCalendar(professionalUserId: string, month: number, year: number) {
    const professionalId = await this.getProfessionalId(professionalUserId)

    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate   = new Date(year, month, 0).toISOString().split('T')[0]

    return this.prisma.booking.findMany({
      where: {
        professionalId,
        date:   { gte: startDate, lte: endDate },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
        service:  { select: { name: true, duration: true } },
        customer: { select: { fullName: true } },
      },
    })
  }

  async findOne(id: string, currentUser: { id: string; role: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service:      true,
        professional: { include: { user: true } },
        customer:     true,
      },
    })
    if (!booking) throw new NotFoundException('Booking not found')

    // Authorization check
    if (
      currentUser.role !== 'ADMIN' &&
      booking.customerId !== currentUser.id &&
      booking.professional?.userId !== currentUser.id
    ) throw new ForbiddenException()

    return booking
  }

  async updateStatus(id: string, status: string, currentUser: { id: string; role: string }) {
    const booking = await this.prisma.booking.findUnique({ where: { id } })
    if (!booking) throw new NotFoundException()

    const updated = await this.prisma.booking.update({
      where: { id },
      data:  { status: status as any },
    })

    this.events.emit('booking.statusChanged', updated)
    return updated
  }

  async cancel(id: string, currentUser: { id: string; role: string }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { professional: true },
    })
    if (!booking) throw new NotFoundException()

    // 24h cancellation check
    const bookingDate = new Date(`${booking.date}T${booking.time}`)
    const hoursUntil  = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60)

    if (currentUser.role !== 'ADMIN' && hoursUntil < 24) {
      throw new BadRequestException('Cancellations require 24h notice')
    }

    return this.prisma.booking.update({
      where: { id },
      data:  { status: 'CANCELLED', cancelledAt: new Date() },
    })
  }

  async generateQrCode(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } })
    if (!booking) throw new NotFoundException()

    const qrData = JSON.stringify({
      bookingId: id,
      date:      booking.date,
      time:      booking.time,
    })
    const qrCode = await QRCode.toDataURL(qrData)
    return { qrCode, bookingId: id }
  }

  async checkIn(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } })
    if (!booking) throw new NotFoundException()
    if (booking.status !== 'CONFIRMED') throw new BadRequestException('Booking is not confirmed')

    return this.prisma.booking.update({
      where: { id },
      data:  { status: 'IN_PROGRESS', checkedInAt: new Date() },
    })
  }

  private async getProfessionalId(userId: string): Promise<string> {
    const pro = await this.prisma.professional.findUnique({ where: { userId } })
    if (!pro) throw new ForbiddenException('No professional profile found')
    return pro.id
  }

  private assertWithinWorkingHours(date: string, time: string, duration: number, openingHours: any) {
    const dayKey = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const day = openingHours?.[dayKey]
    if (day?.closed || !day?.open || !day?.close) throw new BadRequestException('The salon is closed on this date')

    const start = this.minutes(time)
    const end = start + duration
    const open = this.minutes(day.open)
    const close = this.minutes(day.close)

    if (start < open || end > close) {
      throw new BadRequestException('Selected time is outside salon working hours')
    }
  }

  private minutes(value: string) {
    const [hours, mins] = value.split(':').map(Number)
    return (hours * 60) + mins
  }
}
