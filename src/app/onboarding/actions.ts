"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, users, reservedUsernames } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import {
  validateUsername,
  normalizeUsername,
} from "@/lib/security/usernames";

type OnboardingInput = {
  userId: string;
  username: string;
  accountType: string;
  objective: string;
};

export async function completeOnboarding(
  input: OnboardingInput,
): Promise<{ success: true } | { success: false; error: string }> {
  const user = await getCurrentDbUser();

  if (user.id !== input.userId) {
    return { success: false, error: "Unauthorized" };
  }

  const username = normalizeUsername(input.username);
  const validation = validateUsername(username);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }

  const [existingProfile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);

  if (existingProfile) {
    return { success: false, error: "That username is already taken." };
  }

  const [reserved] = await db
    .select({ username: reservedUsernames.username })
    .from(reservedUsernames)
    .where(eq(reservedUsernames.username, username))
    .limit(1);

  if (reserved) {
    return { success: false, error: "That username is reserved." };
  }

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || username;

  await db.insert(profiles).values({
    userId: user.id,
    username,
    displayName,
    isPublished: true,
    visibility: "public",
  });

  await db
    .update(users)
    .set({
      onboardingCompleted: true,
      accountType: input.accountType,
      primaryObjective: input.objective,
    })
    .where(eq(users.id, user.id));

  return { success: true };
}
