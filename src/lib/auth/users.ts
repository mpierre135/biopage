import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type ClerkUserData = {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
};

/**
 * Creates a user row if one doesn't exist, or updates email/name/image if it
 * has changed. Returns the canonical DB user.
 */
export async function upsertUserFromClerk(data: ClerkUserData) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, data.clerkId))
    .limit(1);

  if (existing) {
    const needsUpdate =
      existing.email !== data.email ||
      existing.firstName !== (data.firstName ?? null) ||
      existing.lastName !== (data.lastName ?? null) ||
      existing.imageUrl !== (data.imageUrl ?? null);

    if (!needsUpdate) return existing;

    const [updated] = await db
      .update(users)
      .set({
        email: data.email,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        imageUrl: data.imageUrl ?? null,
      })
      .where(eq(users.clerkId, data.clerkId))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(users)
    .values({
      clerkId: data.clerkId,
      email: data.email,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      imageUrl: data.imageUrl ?? null,
    })
    .returning();

  return created;
}

/**
 * Fetches a DB user by Clerk ID. Returns `null` when not found.
 */
export async function getUserByClerkId(clerkId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  return user ?? null;
}
