import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import express from 'express'
import { AppModule } from '../src/app.module'

const server = express()
let isReady = false

async function bootstrap() {
  if (isReady) return

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  })

  const config = app.get(ConfigService)
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000')
  const extraUrls = (config.get<string>('FRONTEND_URLS', '') || '')
    .split(',').map((v: string) => v.trim()).filter(Boolean)
  const allowedOrigins = Array.from(new Set([frontendUrl, ...extraUrls, 'https://afroglow.lt']))

  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", 'data:', 'https:'] },
    },
  }))

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const ok = allowedOrigins.includes(origin) ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
      callback(ok ? null : new Error('Not allowed by CORS'), ok)
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
  })

  app.setGlobalPrefix('api', { exclude: ['health'] })

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }))

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Afroglow API')
    .setDescription('Afroglow Salon Marketplace & Chair Rental Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth',          'Authentication endpoints')
    .addTag('users',         'User management')
    .addTag('bookings',      'Booking management')
    .addTag('services',      'Service catalogue')
    .addTag('spots',         'Rental spot management')
    .addTag('applications',  'Rental applications')
    .addTag('professionals', 'Professional profiles')
    .addTag('reviews',       'Reviews & ratings')
    .addTag('analytics',     'Analytics & reports')
    .addTag('notifications', 'Notifications')
    .addTag('admin',         'Admin operations')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  })

  await app.init()
  isReady = true
}

export default async function handler(req: any, res: any) {
  await bootstrap()
  server(req, res)
}
