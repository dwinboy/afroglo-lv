import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  })

  const config = app.get(ConfigService)
  const primaryFrontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000')
  const extraFrontendUrls = (config.get<string>('FRONTEND_URLS', '') || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
  const allowedOrigins = Array.from(new Set([
    primaryFrontendUrl,
    ...extraFrontendUrls,
    // Production domains, allowed by default so a missing/incorrect
    // FRONTEND_URL can never take the live site's API calls down.
    'https://afroglowstudio.com',
    'https://www.afroglowstudio.com',
    'https://afroglow.lt',
    'https://www.afroglow.lt',
  ]))

  /* ── Security ──────────────────────── */
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    // The frontend lives on a different domain (afroglowstudio.com), so images
    // served here are embedded cross-origin. Helmet's default 'same-origin'
    // policy makes browsers refuse to render them, so allow cross-origin.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc:     ["'self'", 'data:', 'https:'],
      },
    },
  }))

  /* ── CORS ──────────────────────────── */
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)

      const isExplicitlyAllowed = allowedOrigins.includes(origin)
      const isVercelPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)

      if (isExplicitlyAllowed || isVercelPreview) {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    },
    methods:          'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:   ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials:      true,
    preflightContinue:false,
    optionsSuccessStatus: 204,
  })

  /* ── Global prefix ─────────────────── */
  app.setGlobalPrefix('api', { exclude: ['health'] })

  /* ── Validation ────────────────────── */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
      transformOptions:     { enableImplicitConversion: true },
    }),
  )

  /* ── Swagger ───────────────────────── */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Afroglow API')
    .setDescription('Afroglow Salon Marketplace & Chair Rental Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth',         'Authentication endpoints')
    .addTag('users',        'User management')
    .addTag('bookings',     'Booking management')
    .addTag('services',     'Service catalogue')
    .addTag('spots',        'Rental spot management')
    .addTag('applications', 'Rental applications')
    .addTag('professionals','Professional profiles')
    .addTag('reviews',      'Reviews & ratings')
    .addTag('analytics',    'Analytics & reports')
    .addTag('notifications','Notifications')
    .addTag('admin',        'Admin operations')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  })

  /* ── Health check ─────────────────── */
  // Simple health endpoint (NestJS resolves before prefix)
  const port = config.get<number>('PORT', 4000)
  await app.listen(port, '0.0.0.0')

  console.log(`
  ╔══════════════════════════════════════╗
  ║      🌟  AFROGLOW API  🌟            ║
  ║   Luxury Salon Marketplace API       ║
  ╠══════════════════════════════════════╣
  ║  Server:  http://localhost:${port}       ║
  ║  Swagger: http://localhost:${port}/api/docs ║
  ║  Env:     ${config.get('NODE_ENV', 'development')}            ║
  ╚══════════════════════════════════════╝
  `)
}

bootstrap()
