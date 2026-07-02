import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CHART_COLORS = ['#D4AF37', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#eab308', '#64748b']

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalUsers,
      activeBarbers,
      totalBookings,
      totalSpots,
      occupiedSpots,
      pendingApplications,
      activeRenters,
      visibleReviews,
      pendingReviews,
      completedBookings,
      paidPayments,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'BARBER', isActive: true } }),
      this.prisma.booking.count(),
      this.prisma.rentalSpot.count(),
      this.prisma.rentalSpot.count({ where: { isAvailable: false } }),
      this.prisma.rentalApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.professional.count({ where: { rentalStatus: 'ACTIVE' } }),
      this.prisma.review.findMany({ where: { isVisible: true }, select: { rating: true } }),
      this.prisma.review.count({ where: { isVisible: false } }),
      this.prisma.booking.findMany({
        where: { status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] } },
        include: { service: { select: { price: true } } },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ])

    const today = new Date().toISOString().split('T')[0]
    const todayBookings = await this.prisma.booking.count({
      where: { date: today, status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
    })
    const monthPrefix = today.slice(0, 7)
    const monthlyBookings = await this.prisma.booking.count({
      where: { date: { startsWith: monthPrefix } },
    })
    const bookingRevenue = completedBookings.reduce((sum, booking) => {
      return sum + (booking.totalAmount ?? booking.service?.price ?? 0)
    }, 0)
    const totalRevenue = paidPayments._sum.amount ?? bookingRevenue
    const avgSatisfaction = visibleReviews.length
      ? visibleReviews.reduce((sum, review) => sum + review.rating, 0) / visibleReviews.length
      : 0

    return {
      totalUsers,
      activeBarbers,
      activeRenters,
      totalBookings,
      monthlyBookings,
      todayBookings,
      totalSpots,
      occupiedSpots,
      availableSpots: totalSpots - occupiedSpots,
      occupancyRate:  totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0,
      pendingApplications,
      pendingReviews,
      totalRevenue,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
    }
  }

  async getRevenue(period: string) {
    const now = new Date()
    const months = period === 'yearly' ? 12 : 6
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1)
    const startDate = start.toISOString().split('T')[0]

    const bookings = await this.prisma.booking.findMany({
      where: { date: { gte: startDate } },
      include: { service: { select: { price: true } } },
    })

    const rows = Array.from({ length: months }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1)
      return {
        month: MONTH_NAMES[date.getMonth()],
        year: date.getFullYear(),
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        revenue: 0,
        bookings: 0,
      }
    })
    const byKey = new Map(rows.map(row => [row.key, row]))

    for (const booking of bookings) {
      const row = byKey.get(booking.date.slice(0, 7))
      if (!row) continue
      row.bookings += 1
      if (booking.status !== 'CANCELLED' && booking.status !== 'NO_SHOW') {
        row.revenue += booking.totalAmount ?? booking.service?.price ?? 0
      }
    }

    return rows.map(({ key, ...row }) => row)
  }

  async getBookings(period: string) {
    return this.prisma.booking.groupBy({
      by:     ['status'],
      _count: { _all: true },
    })
  }

  async getOccupancy() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]
    const [bookings, totalSpots] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          date: { gte: startDate },
          status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
        },
        select: { date: true },
      }),
      this.prisma.rentalSpot.count(),
    ])

    const counts = Array(7).fill(0)
    const occurrences = Array(7).fill(0)
    for (let offset = 0; offset < 30; offset++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(thirtyDaysAgo.getDate() + offset)
      occurrences[date.getDay()] += 1
    }
    for (const booking of bookings) {
      counts[new Date(`${booking.date}T00:00:00`).getDay()] += 1
    }

    return [1, 2, 3, 4, 5, 6, 0].map(dayIndex => {
      const capacity = Math.max(totalSpots * occurrences[dayIndex], 1)
      return {
        day: WEEKDAY_NAMES[dayIndex],
        rate: Math.min(100, Math.round((counts[dayIndex] / capacity) * 100)),
        bookings: counts[dayIndex],
      }
    })
  }

  async getTopProfessionals(limit: number) {
    const professionals = await this.prisma.professional.findMany({
      include: {
        user: { select: { fullName: true, avatarUrl: true, email: true } },
        bookings: {
          where: { status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] } },
          include: { service: { select: { price: true } } },
        },
      },
    })

    return professionals
      .map(pro => ({
        id: pro.id,
        name: pro.user.fullName,
        avatarUrl: pro.user.avatarUrl,
        email: pro.user.email,
        role: pro.specialization ?? 'Professional',
        bookings: pro.bookings.length,
        revenue: pro.bookings.reduce((sum, booking) => sum + (booking.totalAmount ?? booking.service?.price ?? 0), 0),
        rating: pro.avgRating,
        reviewCount: pro.reviewCount,
      }))
      .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings || b.rating - a.rating)
      .slice(0, limit)
  }

  async getServiceDistribution() {
    const services = await this.prisma.service.findMany({
      include: {
        bookings: {
          where: { status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
          select: { totalAmount: true },
        },
      },
    })

    return services
      .map((service, index) => ({
        id: service.id,
        name: service.name,
        category: service.category,
        value: service.bookings.length,
        revenue: service.bookings.reduce((sum, booking) => sum + (booking.totalAmount ?? service.price), 0),
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter(service => service.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }
}
