# BioHub Architecture

## Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| Framework     | Next.js 16 (App Router)         |
| Language      | TypeScript 5                    |
| Auth          | Clerk (`@clerk/nextjs`)         |
| Database      | Neon Postgres (serverless)      |
| ORM           | Drizzle ORM                     |
| Payments      | Stripe (subscriptions + orders) |
| Storage       | Cloudflare R2 (S3-compatible)   |
| Email         | Resend                          |
| Styling       | Tailwind CSS 4                  |
| UI Components | shadcn/ui                       |
| Testing       | Vitest + Playwright             |

## Directory Structure

```
src/
├── app/
│   ├── (marketing)/          # Landing, features, pricing pages
│   ├── [username]/           # Public bio page (dynamic route)
│   ├── api/
│   │   ├── collect/          # Analytics pixel endpoint
│   │   ├── v1/               # REST API (checkout, capture, etc.)
│   │   └── webhooks/         # Clerk & Stripe webhook handlers
│   ├── dashboard/            # Authenticated dashboard
│   │   ├── analytics/
│   │   ├── audience/
│   │   ├── billing/
│   │   ├── design/           # Theme & block editor
│   │   ├── links/
│   │   ├── products/
│   │   ├── qr/
│   │   └── settings/
│   ├── download/[token]/     # Gated digital-product downloads
│   ├── onboarding/           # Post-signup onboarding flow
│   ├── sign-in/              # Clerk sign-in
│   └── sign-up/              # Clerk sign-up
├── components/
│   ├── blocks/               # Per-block-type Editor + Render pairs
│   ├── dashboard/            # Dashboard shell & shared components
│   ├── profile/              # Public profile renderers
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── actions/              # Server Actions
│   ├── analytics/            # Event ingestion & query helpers
│   ├── auth/                 # Session helpers, user sync
│   ├── billing/              # Feature keys, entitlements, Stripe
│   ├── blocks/               # Block type registry & schemas
│   ├── brand/                # Branding badge config
│   ├── db/                   # Drizzle client + schema
│   │   └── schema/           # core · commerce · platform
│   ├── email/                # Resend transactional emails
│   ├── security/             # Reserved usernames, URL validation
│   ├── social/               # Social provider registry
│   ├── storage/              # R2 upload/presign helpers
│   ├── themes/               # ThemeConfig types, presets, resolver
│   └── validation/           # Zod schemas for profile data
scripts/
│   └── seed.ts               # Database seed script
docs/                         # Project documentation
```

## Auth Flow

```
Browser ──► Clerk (sign-in/sign-up)
                │
                ▼
        Clerk Webhook (user.created / user.updated)
                │
                ▼
        /api/webhooks/clerk
                │
                ▼
        Upsert `users` row in Postgres
                │
                ▼
        Redirect to /onboarding (first visit)
        or /dashboard (returning user)
```

Clerk manages all authentication state. A webhook listener syncs user
data into the local `users` table so Drizzle queries can join on
`users.clerkId`. The `session` helper in `lib/auth/session.ts` wraps
`auth()` to resolve the current DB user.

## Data Flow

```
Client ──► Server Action / API Route
                │
                ▼
        lib/auth/session.ts  (resolve user + check entitlements)
                │
                ▼
        lib/db  (Drizzle ORM queries over Neon Postgres)
                │
                ▼
        Return typed result to client
```

All database access goes through the shared Drizzle client at
`lib/db/index.ts` which connects to Neon via WebSocket. The schema is
split into three files:

- **core.ts** — users, profiles, blocks, themes, social links, domains
- **commerce.ts** — analytics, audience, products, orders, plans, subscriptions
- **platform.ts** — webhooks, integrations, QR codes, reports, experiments

## Block System

Blocks are the fundamental content units of a profile page. Each block
type has:

1. A **Drizzle row** in the `blocks` table with a `type` enum and a
   JSONB `config` column.
2. A **BlockDescriptor** registered in `lib/blocks/registry.ts` that
   provides the Zod schema, default config, Editor component, and
   Render component.
3. An **Editor** (dashboard) and **Render** (public page) React
   component pair under `components/blocks/<type>/`.

Adding a new block type:

1. Add the enum value to `blockTypeEnum` in `lib/db/schema/core.ts`.
2. Create a descriptor with Zod schema + React components.
3. Call `registerBlock(descriptor)` in `lib/blocks/index.ts`.

## Theme System

Themes control the visual design of a public profile page.

- **ThemeConfig** (`lib/themes/types.ts`) defines the full token surface:
  background, typography, buttons, colors, cards, and layout.
- **Presets** (`lib/themes/presets.ts`) ships 40 built-in themes (20 free,
  20 premium) across 12 categories.
- **Resolver** (`lib/themes/resolver.ts`) converts a `ThemeConfig` into
  CSS custom properties that the profile page consumes.
- Themes are stored in the `themes` table and referenced by
  `profiles.themeId`. Users can also override tokens via
  `profiles.designConfig`.
