import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../mail/mail.service'
import { CreateProfessionalDto } from './dto/create-professional.dto'

const DEFAULT_SERVICES = [
  { name: 'Classic Haircut',     category: 'Hair',         price: 15,  duration: 45,  icon: '✂️',  isActive: true },
  { name: 'Fade & Taper',        category: 'Hair',         price: 25,  duration: 60,  icon: '💈',  isActive: true },
  { name: 'Beard Trim & Shape',  category: 'Beard',        price: 12,  duration: 30,  icon: '🪒',  isActive: true },
  { name: 'Haircut + Beard',     category: 'Beard',        price: 35,  duration: 90,  icon: '👑',  isActive: true },
  { name: 'Box Braids',          category: 'Braids & Locs',price: 80,  duration: 300, icon: '🧵',  isActive: true },
  { name: 'Knotless Braids',     category: 'Braids & Locs',price: 100, duration: 360, icon: '🌀',  isActive: true },
  { name: 'Cornrows',            category: 'Braids & Locs',price: 40,  duration: 120, icon: '💫',  isActive: true },
  { name: 'Dreadlocks Install',  category: 'Braids & Locs',price: 120, duration: 480, icon: '🔒',  isActive: true },
  { name: 'Locs Retwist',        category: 'Braids & Locs',price: 60,  duration: 180, icon: '🔧',  isActive: true },
  { name: 'Wig Installation',    category: 'Hair',         price: 80,  duration: 120, icon: '👸',  isActive: true },
  { name: 'Hair Coloring',       category: 'Color',        price: 60,  duration: 180, icon: '🎨',  isActive: true },
  { name: 'Highlights & Balayage',category:'Color',        price: 90,  duration: 240, icon: '✨',  isActive: true },
  { name: 'Deep Conditioning',   category: 'Treatments',   price: 35,  duration: 60,  icon: '💧',  isActive: true },
  { name: 'Scalp Treatment',     category: 'Treatments',   price: 40,  duration: 45,  icon: '🌿',  isActive: true },
  { name: "Kids' Haircut",       category: 'Special',      price: 12,  duration: 30,  icon: '👶',  isActive: true },
  { name: "Women's Styling",     category: 'Hair',         price: 35,  duration: 75,  icon: '💁',  isActive: true },
]

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail:   MailService,
  ) {}

  async getDashboardStats() {
    const [users, barbers, bookings, spots, pendingApps, reviews] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'BARBER' } }),
      this.prisma.booking.count(),
      this.prisma.rentalSpot.count(),
      this.prisma.rentalApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.review.count({ where: { isVisible: true } }),
    ])

    return { users, barbers, bookings, spots, pendingApps, reviews }
  }

  async suspendUser(id: string, reason?: string) {
    return this.prisma.user.update({
      where: { id },
      data:  { isActive: false, suspensionReason: reason },
    })
  }

  async broadcast(dto: { title: string; message: string; roles?: string[] }) {
    const where: any = {}
    if (dto.roles?.length) where.role = { in: dto.roles }

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true, email: true, fullName: true },
    })

    await this.prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        type:   'BROADCAST',
        title:  dto.title,
        body:   dto.message,
      })),
    })

    return { sent: users.length }
  }

  async getBranchSettings() {
    let branch = await this.prisma.branch.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!branch) {
      branch = await this.prisma.branch.create({
        data: {
          name:    'Afroglow Vilnius',
          address: 'Kalvarijų g. 88',
          city:    'Vilnius',
          country: 'Lithuania',
          phone:   '+37069150485',
          email:   'afroglowstudiostudio@gmail.com',
          openingHours: {
            monday:    { open: '09:00', close: '21:00' },
            tuesday:   { open: '09:00', close: '21:00' },
            wednesday: { open: '09:00', close: '21:00' },
            thursday:  { open: '09:00', close: '21:00' },
            friday:    { open: '09:00', close: '21:00' },
            saturday:  { open: '09:00', close: '19:00' },
            sunday:    { open: '10:00', close: '17:00' },
          },
        },
      })
    }

    return branch
  }

  async updateBranchSettings(dto: {
    name?: string
    address?: string
    city?: string
    country?: string
    phone?: string
    email?: string
    openingHours?: any
  }) {
    const branch = await this.getBranchSettings()

    return this.prisma.branch.update({
      where: { id: branch.id },
      data: {
        name:         dto.name,
        address:      dto.address,
        city:         dto.city,
        country:      dto.country,
        phone:        dto.phone,
        email:        dto.email,
        openingHours: dto.openingHours,
      },
    })
  }

  async seedServices() {
    if (process.env.NODE_ENV === 'production') {
      return { message: 'Seeding not allowed in production' }
    }

    let created = 0
    for (const s of DEFAULT_SERVICES) {
      const existing = await this.prisma.service.findFirst({ where: { name: s.name } })
      if (!existing) {
        await this.prisma.service.create({ data: s })
        created++
      }
    }

    return { message: `${created} services seeded` }
  }

  /* ── Gallery management ───────────────────────── */

  async listGallery(filters: { status?: string; page: number; limit: number }) {
    const page = Math.max(filters.page || 1, 1)
    const limit = Math.min(Math.max(filters.limit || 50, 1), 100)
    const where: any = {}

    if (filters.status === 'published') where.isPublished = true
    if (filters.status === 'draft') where.isPublished = false
    if (filters.status === 'featured') where.isFeatured = true

    const [data, total] = await Promise.all([
      this.prisma.galleryItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.galleryItem.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async createGalleryItem(dto: {
    title?: string
    caption?: string
    imageUrl?: string
    category?: string
    tags?: string[] | string
    isFeatured?: boolean
    isPublished?: boolean
    sortOrder?: number
  }) {
    if (!dto.title?.trim()) throw new ConflictException('Gallery title is required')
    if (!dto.imageUrl?.trim()) throw new ConflictException('Gallery image URL is required')

    return this.prisma.galleryItem.create({
      data: {
        title:       dto.title.trim(),
        caption:     dto.caption?.trim() || null,
        imageUrl:    dto.imageUrl.trim(),
        category:    dto.category?.trim() || null,
        tags:        this.normalizeTags(dto.tags),
        isFeatured:  dto.isFeatured ?? false,
        isPublished: dto.isPublished ?? true,
        sortOrder:   dto.sortOrder ?? 0,
      },
    })
  }

  async updateGalleryItem(id: string, dto: {
    title?: string
    caption?: string | null
    imageUrl?: string
    category?: string | null
    tags?: string[] | string
    isFeatured?: boolean
    isPublished?: boolean
    sortOrder?: number
  }) {
    const existing = await this.prisma.galleryItem.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Gallery item not found')

    return this.prisma.galleryItem.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.caption !== undefined ? { caption: dto.caption?.trim() || null } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl.trim() } : {}),
        ...(dto.category !== undefined ? { category: dto.category?.trim() || null } : {}),
        ...(dto.tags !== undefined ? { tags: this.normalizeTags(dto.tags) } : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
        ...(dto.isPublished !== undefined ? { isPublished: dto.isPublished } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    })
  }

  async deleteGalleryItem(id: string) {
    const existing = await this.prisma.galleryItem.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Gallery item not found')
    await this.prisma.galleryItem.delete({ where: { id } })
    return { deleted: true }
  }

  /* ── Professional management ────────────────────── */

  /** Default permissions granted to every new professional */
  private defaultPermissions() {
    return {
      canAcceptBookings:  true,
      canManageServices:  true,
      canViewEarnings:    true,
      canManagePortfolio: true,
      canAccessCalendar:  true,
      canReceiveReviews:  true,
    }
  }

  async createProfessional(dto: CreateProfessionalDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('A user with this email already exists')

    // Generate a temporary password
    const tempPassword = this.generateTempPassword()
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    const permissions = { ...this.defaultPermissions(), ...(dto.permissions ?? {}) }

    const user = await this.prisma.user.create({
      data: {
        email:        dto.email,
        fullName:     dto.fullName,
        phone:        dto.phone,
        passwordHash,
        role:         'BARBER',
        isVerified:   true,
        isActive:     true,
        professional: {
          create: {
            specialization:    dto.specialization,
            yearsOfExperience: dto.yearsOfExperience ?? 0,
            bio:               dto.bio,
            instagramHandle:   dto.instagramHandle,
            rentalSpotId:      dto.rentalSpotId ?? null,
            rentalPlan:        (dto.rentalPlan as any) ?? null,
            rentalStatus:      dto.rentalSpotId ? 'ACTIVE' : 'PENDING',
            rentalStartDate:   dto.rentalSpotId ? new Date() : null,
            permissions,
            adminNotes:        dto.adminNotes,
          },
        },
      },
      include: { professional: true },
    })

    // Mark spot as taken
    if (dto.rentalSpotId) {
      await this.prisma.rentalSpot.update({
        where: { id: dto.rentalSpotId },
        data:  { isAvailable: false },
      })
    }

    // Email credentials to the professional
    this.mail.sendProfessionalWelcome(dto.email, dto.fullName, tempPassword).catch(() => {})

    const { passwordHash: _, ...safeUser } = user as any
    return { ...safeUser, tempPassword }
  }

  async listProfessionals(filters: {
    search?:        string
    rentalStatus?:  string
    page:           number
    limit:          number
  }) {
    const { search, rentalStatus, page, limit } = filters
    const skip = (page - 1) * limit
    const where: any = {}

    if (rentalStatus) where.rentalStatus = rentalStatus
    if (search) where.user = {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email:    { contains: search, mode: 'insensitive' } },
      ],
    }

    const [data, total] = await Promise.all([
      this.prisma.professional.findMany({
        where,
        skip,
        take:    limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user:       { select: { id: true, email: true, fullName: true, avatarUrl: true, phone: true, isActive: true, lastLoginAt: true } },
          rentalSpot: { select: { id: true, spotNumber: true, type: true } },
        },
      }),
      this.prisma.professional.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getProfessional(id: string) {
    const pro = await this.prisma.professional.findUnique({
      where: { id },
      include: {
        user:       { select: { id: true, email: true, fullName: true, avatarUrl: true, phone: true, isActive: true, createdAt: true, lastLoginAt: true } },
        rentalSpot: true,
        services:   true,
      },
    })
    if (!pro) throw new NotFoundException('Professional not found')
    return pro
  }

  async updateProfessionalPermissions(id: string, dto: { permissions: any; adminNotes?: string }) {
    const pro = await this.prisma.professional.findUnique({ where: { id } })
    if (!pro) throw new NotFoundException('Professional not found')

    const merged = { ...(pro.permissions as any ?? this.defaultPermissions()), ...dto.permissions }

    return this.prisma.professional.update({
      where: { id },
      data:  {
        permissions: merged,
        ...(dto.adminNotes !== undefined ? { adminNotes: dto.adminNotes } : {}),
      },
    })
  }

  async updateProfessional(id: string, data: {
    specialization?:    string
    bio?:               string
    instagramHandle?:   string
    rentalSpotId?:      string | null
    rentalPlan?:        string
    rentalStatus?:      string
    adminNotes?:        string
    yearsOfExperience?: number
  }) {
    const pro = await this.prisma.professional.findUnique({
      where: { id },
      include: { user: true }
    })
    if (!pro) throw new NotFoundException('Professional not found')

    // Handle spot reassignment
    if (data.rentalSpotId !== undefined && data.rentalSpotId !== pro.rentalSpotId) {
      // Free old spot
      if (pro.rentalSpotId) {
        await this.prisma.rentalSpot.update({ where: { id: pro.rentalSpotId }, data: { isAvailable: true } })
      }
      // Claim new spot
      if (data.rentalSpotId) {
        await this.prisma.rentalSpot.update({ where: { id: data.rentalSpotId }, data: { isAvailable: false } })
      }
    }

    return this.prisma.professional.update({
      where: { id },
      data:  {
        specialization:    data.specialization,
        bio:               data.bio,
        instagramHandle:   data.instagramHandle,
        rentalSpotId:      data.rentalSpotId,
        rentalPlan:        data.rentalPlan as any,
        rentalStatus:      data.rentalStatus as any,
        adminNotes:        data.adminNotes,
        yearsOfExperience: data.yearsOfExperience,
      },
      include: { user: { select: { id: true, email: true, fullName: true } }, rentalSpot: true },
    })
  }

  async suspendProfessional(id: string, reason?: string) {
    const pro = await this.prisma.professional.findUnique({ where: { id }, include: { user: true } })
    if (!pro) throw new NotFoundException('Professional not found')

    // Suspend their user account too
    await this.prisma.user.update({ where: { id: pro.userId }, data: { isActive: false, suspensionReason: reason } })

    return this.prisma.professional.update({
      where: { id },
      data:  { rentalStatus: 'SUSPENDED', adminNotes: reason },
    })
  }

  async reactivateProfessional(id: string) {
    const pro = await this.prisma.professional.findUnique({ where: { id } })
    if (!pro) throw new NotFoundException('Professional not found')

    await this.prisma.user.update({ where: { id: pro.userId }, data: { isActive: true, suspensionReason: null } })

    return this.prisma.professional.update({
      where: { id },
      data:  { rentalStatus: 'ACTIVE' },
    })
  }

  async resetProfessionalPassword(id: string) {
    const pro = await this.prisma.professional.findUnique({ where: { id }, include: { user: true } })
    if (!pro) throw new NotFoundException('Professional not found')

    const tempPassword = this.generateTempPassword()
    await this.prisma.user.update({
      where: { id: pro.userId },
      data:  { passwordHash: await bcrypt.hash(tempPassword, 12) },
    })

    this.mail.sendProfessionalWelcome(pro.user.email, pro.user.fullName, tempPassword).catch(() => {})

    return { message: 'Password reset. New credentials emailed to professional.' }
  }

  private generateTempPassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let pw = ''
    for (let i = 0; i < 10; i++) pw += chars[Math.floor(Math.random() * chars.length)]
    return pw
  }

  private normalizeTags(tags?: string[] | string) {
    if (!tags) return []
    const source = Array.isArray(tags) ? tags : tags.split(',')
    return source.map(tag => tag.trim()).filter(Boolean)
  }
}
