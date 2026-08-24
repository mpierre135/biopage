# Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL (Neon recommended)
- Clerk account (authentication)
- Stripe account (optional, for payments)

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values. See `docs/ENVIRONMENT.md` for details.

## Database Setup

```bash
# Generate migrations from Drizzle schema
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (plans, features, themes, reserved usernames)
npm run db:seed
```

## Build & Deploy

```bash
npm install
npm run build
npm start
```

## Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set all environment variables in the Vercel dashboard
3. The build command is `npm run build`, output is `.next`
4. After deploy, run the seed script: `npm run db:seed`

## Clerk Webhook Setup

1. Go to Clerk Dashboard > Webhooks
2. Create a new endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret to `CLERK_WEBHOOK_SIGNING_SECRET`

## Stripe Webhook Setup

1. Go to Stripe Dashboard > Webhooks
2. Create endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Subscribe to: `checkout.session.completed`, `customer.subscription.*`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`
