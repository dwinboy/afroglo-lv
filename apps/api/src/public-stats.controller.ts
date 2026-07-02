import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PrismaService } from './prisma/prisma.service'

@ApiTags('stats')
@Controller('stats')
export class PublicStatsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public homepage statistics' })
  async getPublicStats() {
    const [professionals, bookings] = await Promise.all([
      this.prisma.professional.count({
        where: {
          user: {
            role: 'BARBER',
            isActive: true,
          },
        },
      }),
      this.prisma.booking.count({
        where: {
          status: { not: 'CANCELLED' },
        },
      }),
    ])

    return {
      professionals,
      bookings,
      satisfaction: 98,
    }
  }
}
