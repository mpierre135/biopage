# Environment Variables

## Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `NEXT_PUBLIC_APP_URL` | Public URL (e.g., `https://biohub.com`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |

## Authentication (Clerk)

| Variable | Description |
|---|---|
| `CLERK_WEBHOOK_SIGNING_SECRET` | Webhook signature verification |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route (default: `/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route (default: `/sign-up`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | After sign-in redirect (default: `/onboarding`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | After sign-up redirect (default: `/onboarding`) |

## Payments (Stripe) — Optional

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## Email (Resend) — Optional

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender address (e.g., `BioHub <noreply@biohub.com>`) |

## Storage (R2/S3) — Optional

| Variable | Description |
|---|---|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | Bucket name (default: `biohub`) |
| `R2_PUBLIC_URL` | Public bucket URL |

Without R2 variables, file uploads fall back to local disk (`.uploads/` directory, not persisted on serverless).
