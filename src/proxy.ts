import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Routes that are always public — no authentication required.
 *
 * Includes:
 *  - Marketing/static pages
 *  - Auth flows (sign-in / sign-up)
 *  - Inbound webhooks (Stripe, Clerk, etc.)
 *  - Analytics collect endpoint
 *  - Public API
 *  - Digital download redemption
 *  - Short-link redirects (/x/*)
 *  - Username profile pages (anything not starting with a reserved prefix
 *    is a public bio page; see note below)
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/features",
  "/templates",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/collect(.*)",
  "/api/v1/public(.*)",
  "/api/uploads(.*)",
  "/download(.*)",
  "/x/(.*)",
  // Username bio pages: single path segment not matching any reserved prefix.
  // These are served by the [username] catch-all in the App Router.
  "/:username",
  "/:username/(.*)",
]);

/**
 * Routes that always require an authenticated session.
 * Matching here short-circuits the public check.
 */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *  - _next/static (static files)
     *  - _next/image (image optimization)
     *  - favicon.ico, sitemap.xml, robots.txt
     *  - Public static assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff2?|css)).*)",
    "/(api|trpc)(.*)",
  ],
};
