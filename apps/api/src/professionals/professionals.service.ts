import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const pro = await this.prisma.professional.findUnique({
      where: { userId },
      include: {
        user:      { select: { id: true, fullName: true, email: true, avatarUrl: true, phone: true } },
        services:  true,
        portfolio: { orderBy: { order: 'asc' } },
        rentalSpot:true,
      },
    })
    if (!pro) throw new NotFoundException('Professional profile not found')
    return pro
  }

  async getMyPortfolio(userId: string) {
    const pro = await this.prisma.professional.findUnique({ where: { userId } })
    if (!pro) throw new NotFoundException()
    return this.prisma.portfolio.findMany({
      where:   { professionalId: pro.id },
      orderBy: { order: 'asc' },
    })
  }

  async addPortfolioItem(userId: string, dto: {
    imageUrl: string; caption?: string; serviceType?: string; tags?: string[]
  }) {
    const pro = await this.prisma.professional.findUnique({ where: { userId } })
    if (!pro) throw new NotFoundException()
    const count = await this.prisma.portfolio.count({ where: { professionalId: pro.id } })
    return this.prisma.portfolio.create({
      data: {
        professionalId: pro.id,
        imageUrl:       dto.imageUrl,
        caption:        dto.caption,
        serviceType:    dto.serviceType,
        tags:           dto.tags ?? [],
        order:          count,
        isPublic:       true,
      },
    })
  }

  async deletePortfolioItem(userId: string, itemId: string) {
    const item = await this.prisma.portfolio.findUnique({ where: { id: itemId }, include: { professional: true } })
    if (!item) throw new NotFoundException()
    if (item.professional.userId !== userId) throw new ForbiddenException()
    await this.prisma.portfolio.delete({ where: { id: itemId } })
    return { message: 'Deleted' }
  }

  async findAll(filters: { speciality?: string; search?: string; page: number; limit: number }) {
    const { speciality, search, page, limit } = filters
    const skip = (page - 1) * limit

    const where: any = { user: { isActive: true, isVerified: true } }

    if (speciality) where.specialization = { contains: speciality, mode: 'insensitive' }
    if (search) where.user = {
      ...where.user,
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
      ],
    }

    const [data, total] = await Promise.all([
      this.prisma.professional.findMany({
        where, skip, take: limit,
        orderBy: { avgRating: 'desc' },
        include: {
          user:      { select: { fullName: true, avatarUrl: true, email: true } },
          services:  { select: { id: true, name: true, price: true, duration: true } },
          portfolio: {
            where: { isPublic: true },
            orderBy: { order: 'asc' },
            take: 12,
            select: { imageUrl: true, caption: true, serviceType: true },
          },
          rentalSpot:true,
        },
      }),
      this.prisma.professional.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async findOne(id: string) {
    const pro = await this.prisma.professional.findUnique({
      where: { id },
      include: {
        user:         { select: { fullName: true, avatarUrl: true, email: true, phone: true } },
        services:     true,
        portfolio:    { where: { isPublic: true }, orderBy: { order: 'asc' } },
        rentalSpot:   true,
        availability: true,
        reviews: {
          where:   { isVisible: true },
          take:    10,
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { fullName: true, avatarUrl: true } } },
        },
      },
    })
    if (!pro) throw new NotFoundException('Professional not found')
    return pro
  }

  async getAvailability(id: string, date?: string) {
    return this.prisma.availability.findMany({
      where: { professionalId: id },
      orderBy: { dayOfWeek: 'asc' },
    })
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.professional.update({
      where: { userId },
      data,
    })
  }
}
