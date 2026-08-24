# BioHub Deployment Guide

## Prerequisites

- Node.js 20+
- A Neon Postgres database
- A Clerk application
- (Optional) Stripe account, Cloudflare R2 bucket, Resend account

## Local Development

```bash
# Install dependencies
npm install

# Copy environment file and fill in values
cp .env.example .env.local

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

## Vercel Deployment

### 1. Connect Repository

- Import the repo at [vercel.com/new](https://vercel.com/new).
- Framework preset will auto-detect **Next.js**.

### 2. Configure Environment Variables

Add all required variables from [ENVIRONMENT.md](./ENVIRONMENT.md) to
the Vercel project settings under **Settings → Environment Variables**.

At minimum:

```
DATABASE_URL=<neon-connection-string>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk-publishable-key>
CLERK_SECRET_KEY=<clerk-secret-key>
CLERK_WEBHOOK_SECRET=<clerk-webhook-signing-secret>
```

### 3. Database Setup

After the first deploy push the schema and seed data:

```bash
# Push Drizzle schema to Neon
npm run db:push

# Seed plans, features, themes, and demo data
npm run db:seed
```

Or from CI:

```bash
npx drizzle-kit push
npx tsx scripts/seed.ts
```

### 4. Webhook Configuration

#### Clerk

In the Clerk dashboard, create a webhook endpoint pointing to:

```
https://<your-domain>/api/webhooks/clerk
```

Subscribe to events: `user.created`, `user.updated`, `user.deleted`.
Copy the signing secret into `CLERK_WEBHOOK_SECRET`.

#### Stripe

In the Stripe dashboard, create a webhook endpoint pointing to:

```
https://<your-domain>/api/webhooks/stripe
```

Subscribe to events: `checkout.session.completed`,
`customer.subscription.created`, `customer.subscription.updated`,
`customer.subscription.deleted`, `invoice.payment_succeeded`,
`invoice.payment_failed`.
Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 5. Custom Domain (Optional)

- Add the domain in Vercel project settings.
- Update DNS records as instructed by Vercel.
- Update `NEXT_PUBLIC_APP_URL` to the custom domain.

## Useful Commands

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start development server             |
| `npm run build`      | Production build                     |
| `npm run start`      | Start production server              |
| `npm run lint`       | Run ESLint                           |
| `npm run typecheck`  | Type-check without emitting          |
| `npm run test`       | Run Vitest unit tests                |
| `npm run test:e2e`   | Run Playwright E2E tests             |
| `npm run db:generate`| Generate Drizzle migration files     |
| `npm run db:migrate` | Apply pending migrations             |
| `npm run db:push`    | Push schema directly (dev shortcut)  |
| `npm run db:studio`  | Open Drizzle Studio                  |
| `npm run db:seed`    | Run the seed script                  |
