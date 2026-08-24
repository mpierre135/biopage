import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { upsertUserFromClerk } from "./users";

/**
 * Asserts the request is authenticated and returns the Clerk user ID.
 * Redirects to /sign-in if not authenticated (safe to call from Server
 * Components and Route Handlers).
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

/**
 * Returns the canonical DB user for the currently authenticated Clerk session.
 * Creates the row on first access (upsert). Redirects to /sign-in when
 * there is no active session.
 */
export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  return upsertUserFromClerk({
    clerkId: userId,
    email: primaryEmail,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  });
}

/**
 * Verifies the current user owns (or is a member of) the given profile.
 * Throws a 403-equivalent redirect when they do not.
 */
export async function requireProfileAccess(profileId: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [dbUser] = await db
    .select({ id: users.id, isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  if (!dbUser) redirect("/sign-in");

  if (dbUser.isAdmin) return;

  const [profile] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);

  if (!profile || profile.userId !== dbUser.id) {
    redirect("/dashboard?error=forbidden");
  }
}
