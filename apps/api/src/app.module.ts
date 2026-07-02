import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { BookingsModule } from './bookings/bookings.module'
import { ServicesModule } from './services/services.module'
import { SpotsModule } from './spots/spots.module'
import { ApplicationsModule } from './applications/applications.module'
import { ProfessionalsModule } from './professionals/professionals.module'
import { ReviewsModule } from './reviews/reviews.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { NotificationsModule } from './notifications/notifications.module'
import { AdminModule } from './admin/admin.module'
import { UploadModule } from './upload/upload.module'
import { MailModule } from './mail/mail.module'
import { ContractsModule } from './contracts/contracts.module'
import { HealthController } from './health.controller'
import { BranchSettingsController } from './branch-settings.controller'
import { PublicStatsController } from './public-stats.controller'

@Module({
  imports: [
    /* ── Config ──────────────────────── */
    ConfigModule.forRoot({
      isGlobal:  true,
      envFilePath: ['.env.local', '.env'],
    }),

    /* ── Rate limiting ───────────────── */
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10  },
      { name: 'medium', ttl: 10000, limit: 50  },
      { name: 'long',   ttl: 60000, limit: 200 },
    ]),

    /* ── Events & Scheduling ─────────── */
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    /* ── Database ────────────────────── */
    PrismaModule,

    /* ── Feature modules ─────────────── */
    AuthModule,
    UsersModule,
    BookingsModule,
    ServicesModule,
    SpotsModule,
    ApplicationsModule,
    ProfessionalsModule,
    ReviewsModule,
    AnalyticsModule,
    NotificationsModule,
    AdminModule,
    UploadModule,
    MailModule,
    ContractsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  controllers: [HealthController, BranchSettingsController, PublicStatsController],
})
export class AppModule {}
