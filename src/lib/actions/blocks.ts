"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { blocks, profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import {
  blockCreateSchema,
  blockUpdateSchema,
  type BlockCreateInput,
  type BlockUpdateInput,
} from "@/lib/validation/profile";
import { getBlock } from "@/lib/blocks/registry";
import "@/lib/blocks";
import { canUseFeature, getUserPlan } from "@/lib/billing/entitlements";
import { getPlanLimits, type FeatureKey, FEATURE_KEYS } from "@/lib/billing/features";

type ActionResult = {
  success: boolean;
  error?: string;
  blockId?: string;
};

async function verifyProfileOwnership(profileId: string, userId: string) {
  const [profile] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);

  return profile?.userId === userId;
}

function isFeatureKey(value: string): value is FeatureKey {
  return (FEATURE_KEYS as readonly string[]).includes(value);
}

export async function createBlock(
  profileId: string,
  data: BlockCreateInput,
): Promise<ActionResult> {
  const user = await getCurrentDbUser();
  if (!(await verifyProfileOwnership(profileId, user.id))) {
    return { success: false, error: "Access denied." };
  }

  const parsed = blockCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid block data." };
  }

  const descriptor = getBlock(parsed.data.type);
  if (!descriptor || descriptor.ready === false) {
    return { success: false, error: "This block type is not available yet." };
  }

  if (descriptor.requiredFeature && isFeatureKey(descriptor.requiredFeature)) {
    const allowed = await canUseFeature(user.id, descriptor.requiredFeature);
    if (!allowed) {
      return {
        success: false,
        error: "Upgrade your plan to use this block.",
      };
    }
  }

  // Capture blocks require leadCapture
  if (
    (parsed.data.type === "EMAIL_CAPTURE" ||
      parsed.data.type === "SMS_CAPTURE") &&
    !(await canUseFeature(user.id, "leadCapture"))
  ) {
    return {
      success: false,
      error: "Upgrade to Creator or higher to capture leads.",
    };
  }

  const plan = await getUserPlan(user.id);
  const limits = getPlanLimits(plan.slug);
  const [countRow] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(blocks)
    .where(eq(blocks.profileId, profileId));
  if (Number(countRow?.total ?? 0) >= limits.blocks) {
    return {
      success: false,
      error: `Free plan allows up to ${limits.blocks} blocks. Upgrade to add more.`,
    };
  }

  const [maxPos] = await db
    .select({ max: sql<number>`COALESCE(MAX(${blocks.position}), -1)` })
    .from(blocks)
    .where(eq(blocks.profileId, profileId));

  const position = parsed.data.position ?? (maxPos?.max ?? -1) + 1;

  const [block] = await db
    .insert(blocks)
    .values({
      profileId,
      type: parsed.data.type,
      position,
      enabled: parsed.data.enabled,
      config: parsed.data.config as Record<string, unknown>,
      publishAt: parsed.data.publishAt ?? null,
      expireAt: parsed.data.expireAt ?? null,
      timezone: parsed.data.timezone ?? null,
      collectionId: parsed.data.collectionId ?? null,
    })
    .returning({ id: blocks.id });

  revalidatePath("/dashboard/links");
  return { success: true, blockId: block.id };
}

export async function updateBlock(
  blockId: string,
  data: BlockUpdateInput,
): Promise<ActionResult> {
  const user = await getCurrentDbUser();

  const [block] = await db
    .select({ profileId: blocks.profileId })
    .from(blocks)
    .where(eq(blocks.id, blockId))
    .limit(1);

  if (!block) return { success: false, error: "Block not found." };
  if (!(await verifyProfileOwnership(block.profileId, user.id))) {
    return { success: false, error: "Access denied." };
  }

  const parsed = blockUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid block data." };
  }

  if (
    (parsed.data.publishAt !== undefined ||
      parsed.data.expireAt !== undefined) &&
    !(await canUseFeature(user.id, "scheduledLinks"))
  ) {
    return {
      success: false,
      error: "Upgrade to schedule links.",
    };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.position !== undefined) updateData.position = parsed.data.position;
  if (parsed.data.enabled !== undefined) updateData.enabled = parsed.data.enabled;
  if (parsed.data.config !== undefined) updateData.config = parsed.data.config;
  if (parsed.data.publishAt !== undefined) updateData.publishAt = parsed.data.publishAt;
  if (parsed.data.expireAt !== undefined) updateData.expireAt = parsed.data.expireAt;
  if (parsed.data.timezone !== undefined) updateData.timezone = parsed.data.timezone;
  if (parsed.data.collectionId !== undefined) updateData.collectionId = parsed.data.collectionId;

  await db.update(blocks).set(updateData).where(eq(blocks.id, blockId));

  revalidatePath("/dashboard/links");
  return { success: true };
}

export async function deleteBlock(blockId: string): Promise<ActionResult> {
  const user = await getCurrentDbUser();

  const [block] = await db
    .select({ profileId: blocks.profileId })
    .from(blocks)
    .where(eq(blocks.id, blockId))
    .limit(1);

  if (!block) return { success: false, error: "Block not found." };
  if (!(await verifyProfileOwnership(block.profileId, user.id))) {
    return { success: false, error: "Access denied." };
  }

  await db.delete(blocks).where(eq(blocks.id, blockId));

  revalidatePath("/dashboard/links");
  return { success: true };
}

export async function reorderBlocks(
  profileId: string,
  blockIds: string[],
): Promise<ActionResult> {
  const user = await getCurrentDbUser();
  if (!(await verifyProfileOwnership(profileId, user.id))) {
    return { success: false, error: "Access denied." };
  }

  await Promise.all(
    blockIds.map((id, index) =>
      db
        .update(blocks)
        .set({ position: index })
        .where(and(eq(blocks.id, id), eq(blocks.profileId, profileId))),
    ),
  );

  revalidatePath("/dashboard/links");
  return { success: true };
}
