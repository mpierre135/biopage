# BioHub Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

## Required

| Variable                          | Description                                            |
| --------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`                    | Neon Postgres connection string (pooled, WebSocket)    |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (from Clerk dashboard)         |
| `CLERK_SECRET_KEY`                | Clerk secret key                                       |
| `CLERK_WEBHOOK_SECRET`            | Signing secret for the Clerk webhook endpoint          |

## Stripe (optional — required for payments)

| Variable                    | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `STRIPE_SECRET_KEY`         | Stripe secret API key                          |
| `STRIPE_WEBHOOK_SECRET`     | Signing secret for the Stripe webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side)   |

## R2 Storage (optional — required for uploads)

| Variable              | Description                                  |
| --------------------- | -------------------------------------------- |
| `R2_ACCOUNT_ID`       | Cloudflare account ID                        |
| `R2_ACCESS_KEY_ID`    | R2 S3-compatible access key ID               |
| `R2_SECRET_ACCESS_KEY`| R2 S3-compatible secret access key           |
| `R2_BUCKET_NAME`      | R2 bucket name (e.g. `biohub-uploads`)       |
| `R2_PUBLIC_URL`       | Public URL prefix for the bucket             |

## Email (optional — required for transactional email)

| Variable          | Description                       |
| ----------------- | --------------------------------- |
| `RESEND_API_KEY`  | Resend API key                    |
| `EMAIL_FROM`      | Sender address (e.g. `noreply@biohub.com`) |

## App Configuration

| Variable                          | Description                                                  |
| --------------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_APP_URL`             | Public URL of the app (e.g. `https://biohub.com`)            |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`   | Sign-in page path (default: `/sign-in`)                      |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`   | Sign-up page path (default: `/sign-up`)                      |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in (default: `/dashboard`)           |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up (default: `/onboarding`)          |
