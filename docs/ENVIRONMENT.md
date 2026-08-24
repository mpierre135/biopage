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

## Product integrations (optional)

These power **Dashboard → Integrations**. Creators sign in with Clerk; then they connect *their* Shopify / Spotify / Meta / email tools. Without the platform app credentials below, OAuth buttons stay hidden and people can still paste pixel IDs, Shopify store URLs, and email API keys.

Redirect URLs to allowlist on each developer app:

- `https://YOUR_DOMAIN/api/integrations/shopify/callback`
- `https://YOUR_DOMAIN/api/integrations/spotify/callback`
- `https://YOUR_DOMAIN/api/integrations/meta/callback`

Platform apps already created for this repo:

- Shopify Dev Dashboard: org `98541073`, app `414698831873` ([settings](https://dev.shopify.com/dashboard/98541073/apps/414698831873/settings)). Redirects include production (`biopage-rudy-pierres-projects.vercel.app`, `biopage-seven.vercel.app`) and local (`http://localhost:3000` / `3002`) callbacks. Scope: `read_products`.
- Meta Developer app: **BioHub** `944004617992154` ([dashboard](https://developers.facebook.com/apps/944004617992154/), [Login settings](https://developers.facebook.com/apps/944004617992154/business-login/settings/)). `META_APP_ID` / `META_APP_SECRET` are in `.env.local` and Vercel. Valid OAuth Redirect URIs: `https://biopage-rudy-pierres-projects.vercel.app/api/integrations/meta/callback` and `https://biopage-seven.vercel.app/api/integrations/meta/callback`. Meta Enforce HTTPS is on, so `http://localhost` callbacks are rejected — test **Connect Facebook** on a Vercel URL. App is in development mode (admins/testers only until App Review).

| Variable | Description |
|---|---|
| `SHOPIFY_CLIENT_ID` | Shopify custom app client ID (per-store OAuth) |
| `SHOPIFY_CLIENT_SECRET` | Shopify custom app secret |
| `SPOTIFY_CLIENT_ID` | Spotify developer app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify developer app secret |
| `META_APP_ID` | Meta (Facebook) app ID for optional ad-account login |
| `META_APP_SECRET` | Meta app secret |

Pixels (Meta / Google / TikTok) do **not** need these. They use a pixel ID pasted in **Dashboard → Pixels**. Facebook and Instagram ads share the same Meta Pixel.
