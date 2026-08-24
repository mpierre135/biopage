import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";

/**
 * Returns the authenticated user's first (active) profile.
 * Redirects to /sign-in if not authenticated.
 * Returns `null` if the user has no profile yet.
 */
export async function getActiveProfile() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return profile ?? null;
}

/**
 * Returns both the DB user and their active profile.
 */
export async function getActiveProfileWithUser() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  return { user, profile: profile ?? null };
}
