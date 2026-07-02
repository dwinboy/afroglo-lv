import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author:       { select: { fullName: true, avatarUrl: true } },
          professional: { include: { user: { select: { fullName: true } } } },
          booking:      { include: { service: { select: { name: true } } } },
        },
      }),
      this.prisma.review.count(),
    ])
    return { data: data.map(r => ({
      ...r,
      clientName: (r as any).author?.fullName ?? 'Guest',
      service:    r.booking?.service ?? null,
    })), total, page, limit }
  }

  async toggleVisibility(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundException('Review not found')
    const updated = await this.prisma.review.update({
      where: { id },
      data:  { isVisible: !review.isVisible },
    })
    await this.updateProfessionalRating(review.professionalId)
    return updated
  }

  async getForProfessional(professionalId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { professionalId, isVisible: true },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { fullName: true, avatarUrl: true } } },
      }),
      this.prisma.review.count({ where: { professionalId, isVisible: true } }),
    ])

    const avgRating = data.length
      ? data.reduce((a, r) => a + r.rating, 0) / data.length
      : 0

    return { data, total, avgRating: Math.round(avgRating * 10) / 10, page, limit }
  }

  async create(dto: {
    professionalId: string
    bookingId?:     string
    rating:         number
    comment:        string
    authorId:       string
  }) {
    const review = await this.prisma.review.create({
      data: {
        professionalId: dto.professionalId,
        bookingId:      dto.bookingId,
        authorId:       dto.authorId,
        rating:         dto.rating,
        comment:        dto.comment,
        isVisible:      true,
      },
    })

    // Update professional average rating
    await this.updateProfessionalRating(dto.professionalId)

    return review
  }

  async remove(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundException()
    await this.prisma.review.update({ where: { id }, data: { isVisible: false } })
    return { message: 'Review hidden successfully' }
  }

  private async updateProfessionalRating(professionalId: string) {
    const result = await this.prisma.review.aggregate({
      where: { professionalId, isVisible: true },
      _avg:  { rating: true },
      _count:{ _all: true },
    })

    await this.prisma.professional.update({
      where: { id: professionalId },
      data: {
        avgRating:    result._avg.rating ?? 0,
        reviewCount:  result._count._all,
      },
    })
  }
}
