# Architecture

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Auth:** Clerk (`@clerk/nextjs`)
- **Database:** Neon PostgreSQL via Drizzle ORM
- **Payments:** Stripe (optional)
- **Email:** Resend (optional, falls back to console logging)
- **Storage:** Cloudflare R2 / S3-compatible (optional, falls back to local disk)
- **UI:** Tailwind CSS v4 + shadcn/ui (base-nova) + Lucide icons
- **Validation:** Zod v4
- **Animation:** Framer Motion
- **Drag & Drop:** @dnd-kit

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Marketing pages (shared header/footer)
│   ├── [username]/               # Public bio pages
│   ├── api/                      # API routes
│   │   ├── collect/              # Analytics ingestion
│   │   ├── webhooks/             # Clerk + Stripe webhooks
│   │   └── v1/                   # Versioned API
│   ├── dashboard/                # Authenticated dashboard
│   ├── onboarding/               # New user onboarding
│   ├── sign-in/                  # Clerk sign-in
│   └── sign-up/                  # Clerk sign-up
├── components/
│   ├── blocks/                   # Block renderer + editor + 11 block types
│   ├── dashboard/                # Dashboard UI (sidebar)
│   ├── public/                   # Public page components
│   └── ui/                       # shadcn/ui primitives
└── lib/
    ├── actions/                  # Server actions (profile, blocks)
    ├── analytics/                # Event types, ingestion, queries
    ├── auth/                     # Session helpers (requireAuth, getCurrentDbUser)
    ├── billing/                  # Plan entitlements, feature checks
    ├── blocks/                   # Block registry, types, side-effect registrations
    ├── brand/                    # Brand config (name, tagline, etc.)
    ├── db/                       # Drizzle client + schema (core, commerce, platform)
    ├── email/                    # Email provider abstraction
    ├── profiles/                 # Profile helpers (getActiveProfile)
    ├── security/                 # Username validation, URL sanitization
    ├── social/                   # Social provider definitions
    ├── storage/                  # File storage abstraction
    ├── themes/                   # Theme types, CSS var resolver, presets
    └── validation/               # Zod schemas for profile/block inputs
```

## Block System

The block system uses a registry pattern. Each block type registers a descriptor with:
- Zod schema for config validation
- React render component (public page)
- React editor component (dashboard)
- Icon, label, category

Blocks are registered via side-effect imports in `src/lib/blocks/index.ts`.

## Analytics Pipeline

1. Client-side `AnalyticsBeacon` fires a `profile_view` on page load
2. Click events are captured via `data-block-id` attributes
3. Events POST to `/api/collect` → `ingestEvent()`
4. Raw events stored in `analytics_events` table
5. Daily aggregates upserted to `analytics_daily` table

## Auth Flow

1. Clerk handles sign-in/sign-up UI and sessions
2. `src/proxy.ts` middleware protects `/dashboard`, `/onboarding`, `/admin`
3. `getCurrentDbUser()` upserts the Clerk user to our `users` table
4. Dashboard layout redirects to `/onboarding` if not onboarded
5. Webhook at `/api/webhooks/clerk` syncs user data changes
