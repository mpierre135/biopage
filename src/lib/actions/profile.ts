"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";
import { profileUpdateSchema } from "@/lib/validation/profile";
import { normalizeUsername, validateUsername } from "@/lib/security/usernames";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createProfile(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentDbUser();

  const rawUsername = formData.get("username") as string;
  const accountType = formData.get("accountType") as string;
  const displayName = formData.get("displayName") as string;

  if (!rawUsername) return { success: false, error: "Username is required." };

  const username = normalizeUsername(rawUsername);
  const validation = validateUsername(username);
  if (!validation.valid) return { success: false, error: validation.reason };

  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);

  if (existing) {
    return { success: false, error: "That username is already taken." };
  }

  await db.insert(profiles).values({
    userId: user.id,
    username,
    displayName: displayName || user.firstName || username,
    isPublished: true,
  });

  await db
    .update(users)
    .set({
      onboardingCompleted: true,
      accountType: accountType || "creator",
    })
    .where(eq(users.id, user.id));

  redirect("/dashboard");
}

export async function updateProfile(
  profileId: string,
  data: Record<string, unknown>,
): Promise<ActionResult> {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);

  if (!profile || profile.userId !== user.id) {
    return { success: false, error: "Profile not found or access denied." };
  }

  const parsed = profileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { success: false, error: firstError ?? "Invalid data." };
  }

  if (
    parsed.data.customDomain !== undefined &&
    parsed.data.customDomain !== ""
  ) {
    if (!(await canUseFeature(user.id, "customDomain"))) {
      return {
        success: false,
        error: "Upgrade to Creator to use a custom domain.",
      };
    }
  }

  if (parsed.data.username) {
    const [taken] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.username, parsed.data.username))
      .limit(1);

    if (taken && taken.id !== profileId) {
      return { success: false, error: "That username is already taken." };
    }
  }

  await db
    .update(profiles)
    .set(parsed.data)
    .where(eq(profiles.id, profileId));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/design");

  const [updated] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  if (updated?.username) {
    revalidatePath(`/${updated.username}`);
  }

  return { success: true };
}

export async function publishProfile(profileId: string): Promise<ActionResult> {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);

  if (!profile || profile.userId !== user.id) {
    return { success: false, error: "Profile not found or access denied." };
  }

  await db
    .update(profiles)
    .set({ isPublished: true })
    .where(eq(profiles.id, profileId));

  revalidatePath("/dashboard");
  return { success: true };
}
