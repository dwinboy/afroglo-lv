import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'API health check' })
  check() {
    return {
      ok: true,
      service: 'afroglow-api',
      timestamp: new Date().toISOString(),
    }
  }
}
