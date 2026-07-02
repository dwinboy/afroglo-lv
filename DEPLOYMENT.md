# Afroglow Production Deployment

This repo is prepared for:

- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

Deploy in this order: database, backend, then frontend.

## 1. Railway PostgreSQL

1. Open Railway.
2. Create a new project.
3. Add a PostgreSQL database service.
4. Keep it in the same Railway project as the backend.

Railway will provide a `DATABASE_URL`. Use that value for both `DATABASE_URL` and `DIRECT_URL` in the backend service.

## 2. Railway Backend

Create another Railway service from this GitHub repository.

Use these settings:

```text
Service root: repository root
Config file: railway.json
Builder: Nixpacks
Build command: npm install --include=dev && npm --workspace @afroglow/api run build
Start command: npm --workspace @afroglow/api run start:prod
Health check path: /health
```

The `railway.json` file already contains these production settings.

Set these Railway backend variables:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
DIRECT_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=replace-with-another-long-random-secret
FRONTEND_URL=https://your-vercel-app.vercel.app
FRONTEND_URLS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
API_URL=https://your-railway-api-domain.up.railway.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-app-password
SMTP_FROM="Afroglow" <your-email@example.com>
```

Optional variables for later:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
```

After the first successful backend deploy, open the Railway backend shell and run:

```bash
npm --workspace @afroglow/api run prisma:push
npm --workspace @afroglow/api exec ts-node prisma/seed.ts
```

This creates the database tables and the test admin account.

Admin login:

```text
Email: admin@afroglow.lt
Password: Admin@2024!
```

Change the admin password after the first production login.

Backend checks:

```text
Health: https://your-railway-api-domain.up.railway.app/health
Swagger: https://your-railway-api-domain.up.railway.app/api/docs
```

## 3. Vercel Frontend

Import the same GitHub repository into Vercel.

Use these Vercel settings:

```text
Framework preset: Next.js
Root directory: apps/web
Install command: npm install
Build command: npm run build
Output directory: .next
```

Set these Vercel variables:

```env
NEXT_PUBLIC_API_URL=https://your-railway-api-domain.up.railway.app/api
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_APP_NAME=Afroglow
```

Optional variables:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_ENABLE_WHATSAPP=false
NEXT_PUBLIC_ENABLE_LOYALTY=true
NEXT_PUBLIC_ENABLE_REFERRAL=true
```

After Vercel deploys, copy the Vercel domain and update Railway:

```env
FRONTEND_URL=https://your-vercel-app.vercel.app
FRONTEND_URLS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```

Then redeploy the Railway backend so CORS accepts the frontend domain.

## 4. Production Notes

- Uploads currently use local backend disk storage. Railway deployments can lose local files unless persistent storage is attached. Use Railway volumes or move uploads to Cloudinary/S3 before relying on portfolio/gallery uploads in production.
- The seeded admin password is only for first login and testing.
- Booking confirmations are visible in the admin panel.
- Public stats use real database counts for professionals and bookings, with satisfaction fixed at 98%.
- Public pages support English and Lithuanian through the language switcher.
