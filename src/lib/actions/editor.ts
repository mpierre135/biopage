"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  blocks,
  collections,
  dismissedSuggestions,
  integrations,
  profiles,
  socialLinks,
} from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { socialLinkSchema } from "@/lib/validation/profile";

type Result = { success: boolean; error?: string; id?: string; followerCount?: number };
type OrderItem = { kind: "block" | "collection"; id: string };

async function ownedProfile(profileId: string, userId: string) {
  const [profile] = await db.select({ id: profiles.id }).from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId))).limit(1);
  return profile ?? null;
}

function refresh(profileId: string) {
  revalidatePath("/dashboard/links");
  revalidatePath("/dashboard/settings");
  revalidatePath(`/dashboard`);
  return db.select({ username: profiles.username }).from(profiles)
    .where(eq(profiles.id, profileId)).limit(1).then(([p]) => {
      if (p) revalidatePath(`/${p.username}`);
    });
}

export async function createCollection(profileId: string, title: string): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await ownedProfile(profileId, user.id))) return { success: false, error: "Access denied." };
  const clean = title.trim();
  if (!clean || clean.length > 160) return { success: false, error: "Enter a collection name." };
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${collections.position}), -1)` })
    .from(collections).where(eq(collections.profileId, profileId));
  const [row] = await db.insert(collections).values({ profileId, title: clean, position: Number(max) + 1 })
    .returning({ id: collections.id });
  await refresh(profileId);
  return { success: true, id: row.id };
}

export async function updateCollection(
  collectionId: string,
  data: { title?: string; enabled?: boolean },
): Promise<Result> {
  const user = await getCurrentDbUser();
  const [row] = await db.select({ profileId: collections.profileId }).from(collections)
    .innerJoin(profiles, eq(collections.profileId, profiles.id))
    .where(and(eq(collections.id, collectionId), eq(profiles.userId, user.id))).limit(1);
  if (!row) return { success: false, error: "Collection not found." };
  const next: { title?: string; enabled?: boolean } = {};
  if (data.title !== undefined) {
    const title = data.title.trim();
    if (!title || title.length > 160) return { success: false, error: "Enter a collection name." };
    next.title = title;
  }
  if (data.enabled !== undefined) next.enabled = data.enabled;
  await db.update(collections).set(next).where(eq(collections.id, collectionId));
  await refresh(row.profileId);
  return { success: true };
}

export async function setBlockCollection(blockId: string, collectionId: string | null): Promise<Result> {
  const user = await getCurrentDbUser();
  const [block] = await db.select({ profileId: blocks.profileId }).from(blocks)
    .innerJoin(profiles, eq(blocks.profileId, profiles.id))
    .where(and(eq(blocks.id, blockId), eq(profiles.userId, user.id))).limit(1);
  if (!block) return { success: false, error: "Block not found." };
  if (collectionId) {
    const [group] = await db.select({ id: collections.id }).from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.profileId, block.profileId))).limit(1);
    if (!group) return { success: false, error: "Collection not found." };
  }
  await db.update(blocks).set({ collectionId }).where(eq(blocks.id, blockId));
  await refresh(block.profileId);
  return { success: true };
}

export async function reorderEditorItems(profileId: string, items: OrderItem[]): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await ownedProfile(profileId, user.id))) return { success: false, error: "Access denied." };
  await Promise.all(items.map((item, position) => item.kind === "block"
    ? db.update(blocks).set({ position }).where(and(eq(blocks.id, item.id), eq(blocks.profileId, profileId), isNull(blocks.collectionId)))
    : db.update(collections).set({ position }).where(and(eq(collections.id, item.id), eq(collections.profileId, profileId)))));
  await refresh(profileId);
  return { success: true };
}

export async function archiveEditorItem(kind: OrderItem["kind"], id: string, archived: boolean): Promise<Result> {
  const user = await getCurrentDbUser();
  const table = kind === "block" ? blocks : collections;
  const [row] = await db.select({ profileId: table.profileId }).from(table)
    .innerJoin(profiles, eq(table.profileId, profiles.id))
    .where(and(eq(table.id, id), eq(profiles.userId, user.id))).limit(1);
  if (!row) return { success: false, error: "Item not found." };
  await db.update(table).set({ archivedAt: archived ? new Date() : null }).where(eq(table.id, id));
  await refresh(row.profileId);
  return { success: true };
}

export async function deleteCollection(collectionId: string): Promise<Result> {
  const user = await getCurrentDbUser();
  const [row] = await db.select({ profileId: collections.profileId }).from(collections)
    .innerJoin(profiles, eq(collections.profileId, profiles.id))
    .where(and(eq(collections.id, collectionId), eq(profiles.userId, user.id))).limit(1);
  if (!row) return { success: false, error: "Collection not found." };
  await db.delete(collections).where(eq(collections.id, collectionId));
  await refresh(row.profileId);
  return { success: true };
}

export async function saveSocialLink(
  profileId: string,
  input: { id?: string; provider: string; url: string; followerCount?: number | null },
): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await ownedProfile(profileId, user.id))) return { success: false, error: "Access denied." };
  const parsed = socialLinkSchema.safeParse({ ...input, enabled: true });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid social link." };
  const values = {
    provider: parsed.data.provider.toLowerCase(), url: parsed.data.url,
    followerCount: parsed.data.followerCount ?? null,
    followerSource: parsed.data.followerCount == null ? null : "manual",
    followerSyncStatus: parsed.data.followerCount == null ? "manual" : "success",
  };
  if (input.id) {
    await db.update(socialLinks).set(values).where(and(eq(socialLinks.id, input.id), eq(socialLinks.profileId, profileId)));
    await refresh(profileId);
    return { success: true, id: input.id };
  }
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${socialLinks.position}), -1)` })
    .from(socialLinks).where(eq(socialLinks.profileId, profileId));
  const [row] = await db.insert(socialLinks).values({ profileId, position: Number(max) + 1, enabled: true, ...values })
    .returning({ id: socialLinks.id });
  await refresh(profileId);
  return { success: true, id: row.id };
}

export async function deleteSocialLink(profileId: string, id: string): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await ownedProfile(profileId, user.id))) return { success: false, error: "Access denied." };
  await db.delete(socialLinks).where(and(eq(socialLinks.id, id), eq(socialLinks.profileId, profileId)));
  await refresh(profileId);
  return { success: true };
}

export async function dismissSuggestion(profileId: string, ruleKey: string): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await ownedProfile(profileId, user.id))) return { success: false, error: "Access denied." };
  if (!/^[a-z0-9_-]{1,80}$/.test(ruleKey)) return { success: false, error: "Invalid suggestion." };
  await db.insert(dismissedSuggestions).values({ profileId, ruleKey }).onConflictDoNothing();
  await refresh(profileId);
  return { success: true };
}

export async function refreshFollowerCount(profileId: string, socialId: string): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await ownedProfile(profileId, user.id))) return { success: false, error: "Access denied." };
  const [social] = await db.select().from(socialLinks)
    .where(and(eq(socialLinks.id, socialId), eq(socialLinks.profileId, profileId))).limit(1);
  if (!social) return { success: false, error: "Social link not found." };
  if (social.provider !== "spotify") {
    return { success: false, error: "This provider requires a manual follower count." };
  }
  const [integration] = await db.select().from(integrations)
    .where(and(eq(integrations.profileId, profileId), eq(integrations.provider, "spotify"), eq(integrations.enabled, true))).limit(1);
  const accessToken = String((integration?.credentials as Record<string, unknown> | null)?.accessToken ?? "");
  if (!accessToken) return { success: false, error: "Connect Spotify before syncing followers." };
  try {
    const response = await fetch("https://api.spotify.com/v1/me", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    if (!response.ok) throw new Error("Spotify connection needs attention.");
    const body = await response.json() as { followers?: { total?: number } };
    if (typeof body.followers?.total !== "number") throw new Error("Spotify did not return a follower count.");
    await db.update(socialLinks).set({ followerCount: body.followers.total, followerSource: "connected", followerSyncedAt: new Date(), followerSyncStatus: "success" })
      .where(eq(socialLinks.id, socialId));
    await refresh(profileId);
    return { success: true, followerCount: body.followers.total };
  } catch (error) {
    await db.update(socialLinks).set({ followerSyncStatus: "error" }).where(eq(socialLinks.id, socialId));
    return { success: false, error: error instanceof Error ? error.message : "Follower sync failed." };
  }
}
