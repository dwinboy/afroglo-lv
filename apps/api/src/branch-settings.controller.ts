import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PrismaService } from './prisma/prisma.service'

const DEFAULT_OPENING_HOURS = {
  monday:    { open: '09:00', close: '21:00' },
  tuesday:   { open: '09:00', close: '21:00' },
  wednesday: { open: '09:00', close: '21:00' },
  thursday:  { open: '09:00', close: '21:00' },
  friday:    { open: '09:00', close: '21:00' },
  saturday:  { open: '09:00', close: '19:00' },
  sunday:    { open: '10:00', close: '17:00' },
}

@ApiTags('settings')
@Controller('settings')
export class BranchSettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('branch')
  @ApiOperation({ summary: 'Get public branch settings for booking and contact surfaces' })
  async getPublicBranchSettings() {
    const branch = await this.prisma.branch.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        country: true,
        phone: true,
        email: true,
        openingHours: true,
      },
    })

    return branch ?? {
      id: 'main-branch',
      name: 'Afroglow Vilnius',
      address: 'Kalvarijų g. 88',
      city: 'Vilnius',
      country: 'Lithuania',
      phone: '+37069150485',
      email: 'afroglowstudiostudio@gmail.com',
      openingHours: DEFAULT_OPENING_HOURS,
    }
  }
}
