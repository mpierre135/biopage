# Architecture

BioHub is a single Next.js 16 App Router application with domain modules under `src/lib/`.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Clerk auth (`proxy.ts`)
- Neon Postgres + Drizzle ORM (`neon-serverless`)
- Stripe billing (env-gated)
- Resend email (logging fallback)
- R2 / local disk storage

## Key seams

- **Block registry** (`src/lib/blocks`) — extensible page blocks
- **Entitlements** (`src/lib/billing/entitlements.ts`) — `canUseFeature()`
- **Analytics** — `/api/collect` → `analytics_events` + daily rollups

## Routes

- Marketing: `/`, `/features`, `/pricing`
- Auth: `/sign-in`, `/sign-up`, `/onboarding`
- Dashboard: `/dashboard/*`
- Public: `/[username]`
