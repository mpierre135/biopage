"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  integrations,
  profileMembers,
  profiles,
  users,
  experiments,
  experimentVariants,
} from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";

type Result = { success: boolean; error?: string };

async function ownedProfile(userId: string) {
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return profile ?? null;
}

const PIXEL_PROVIDERS = [
  "facebook_pixel",
  "google_analytics",
  "tiktok_pixel",
] as const;

export type PixelProvider = (typeof PIXEL_PROVIDERS)[number];

function isPixelProvider(v: string): v is PixelProvider {
  return (PIXEL_PROVIDERS as readonly string[]).includes(v);
}

export async function upsertPixel(
  provider: string,
  pixelId: string,
  enabled = true,
): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await canUseFeature(user.id, "pixels"))) {
    return { success: false, error: "Upgrade to Pro to add tracking pixels." };
  }
  if (!isPixelProvider(provider)) {
    return { success: false, error: "Unsupported pixel provider." };
  }
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  const trimmed = pixelId.trim();
  if (!trimmed) return { success: false, error: "Pixel ID is required." };

  await db
    .insert(integrations)
    .values({
      profileId: profile.id,
      provider,
      config: { pixelId: trimmed },
      enabled,
    })
    .onConflictDoUpdate({
      target: [integrations.profileId, integrations.provider],
      set: {
        config: { pixelId: trimmed },
        enabled,
      },
    });

  revalidatePath("/dashboard/pixels");
  return { success: true };
}

export async function setPixelEnabled(
  provider: string,
  enabled: boolean,
): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await canUseFeature(user.id, "pixels"))) {
    return { success: false, error: "Upgrade to Pro to manage pixels." };
  }
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };
  if (!isPixelProvider(provider)) {
    return { success: false, error: "Unsupported pixel provider." };
  }

  await db
    .update(integrations)
    .set({ enabled })
    .where(
      and(
        eq(integrations.profileId, profile.id),
        eq(integrations.provider, provider),
      ),
    );

  revalidatePath("/dashboard/pixels");
  return { success: true };
}

export async function removePixel(provider: string): Promise<Result> {
  const user = await getCurrentDbUser();
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  await db
    .delete(integrations)
    .where(
      and(
        eq(integrations.profileId, profile.id),
        eq(integrations.provider, provider),
      ),
    );

  revalidatePath("/dashboard/pixels");
  return { success: true };
}

export async function inviteTeamMember(
  email: string,
  role: "admin" | "editor" | "analyst" | "billing",
): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await canUseFeature(user.id, "teams"))) {
    return { success: false, error: "Upgrade to Business to invite teammates." };
  }
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return { success: false, error: "Enter a valid email." };
  }

  const [memberUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  if (!memberUser) {
    return {
      success: false,
      error: "That person needs a BioHub account first. Ask them to sign up.",
    };
  }

  if (memberUser.id === user.id) {
    return { success: false, error: "You already own this profile." };
  }

  await db
    .insert(profileMembers)
    .values({
      profileId: profile.id,
      userId: memberUser.id,
      role,
    })
    .onConflictDoUpdate({
      target: [profileMembers.profileId, profileMembers.userId],
      set: { role },
    });

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function removeTeamMember(memberId: string): Promise<Result> {
  const user = await getCurrentDbUser();
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  await db
    .delete(profileMembers)
    .where(
      and(
        eq(profileMembers.id, memberId),
        eq(profileMembers.profileId, profile.id),
      ),
    );

  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function createExperiment(name: string): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await canUseFeature(user.id, "abTesting"))) {
    return { success: false, error: "Upgrade to Business for A/B testing." };
  }
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "Name is required." };

  const [exp] = await db
    .insert(experiments)
    .values({ profileId: profile.id, name: trimmed, status: "draft" })
    .returning({ id: experiments.id });

  await db.insert(experimentVariants).values([
    {
      experimentId: exp.id,
      name: "Control",
      config: { label: "A" },
    },
    {
      experimentId: exp.id,
      name: "Variant B",
      config: { label: "B" },
    },
  ]);

  revalidatePath("/dashboard/experiments");
  return { success: true };
}

export async function setExperimentStatus(
  experimentId: string,
  status: "draft" | "running" | "paused" | "completed",
): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await canUseFeature(user.id, "abTesting"))) {
    return { success: false, error: "Upgrade to Business for A/B testing." };
  }
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  await db
    .update(experiments)
    .set({ status })
    .where(
      and(
        eq(experiments.id, experimentId),
        eq(experiments.profileId, profile.id),
      ),
    );

  revalidatePath("/dashboard/experiments");
  return { success: true };
}

export async function deleteExperiment(experimentId: string): Promise<Result> {
  const user = await getCurrentDbUser();
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  await db
    .delete(experiments)
    .where(
      and(
        eq(experiments.id, experimentId),
        eq(experiments.profileId, profile.id),
      ),
    );

  revalidatePath("/dashboard/experiments");
  return { success: true };
}
