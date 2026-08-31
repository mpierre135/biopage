import { eq, asc, and, sql, isNull, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { analyticsEvents, blocks, collections, dismissedSuggestions, integrations, profiles, socialLinks, themes } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { LinksEditor } from "./links-editor";
import type { Metadata } from "next";
import type { ThemeConfig } from "@/lib/themes/types";

export const metadata: Metadata = {
  title: "Links",
};

export default async function LinksPage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) redirect("/onboarding");

  const [profileBlocks, profileCollections, socials, archivedBlocks, archivedCollections, clickRows, dismissed, connected, theme] = await Promise.all([
    db.select().from(blocks).where(and(eq(blocks.profileId, profile.id), isNull(blocks.archivedAt))).orderBy(asc(blocks.position)),
    db.select().from(collections).where(and(eq(collections.profileId, profile.id), isNull(collections.archivedAt))).orderBy(asc(collections.position)),
    db.select().from(socialLinks).where(eq(socialLinks.profileId, profile.id)).orderBy(asc(socialLinks.position)),
    db.select().from(blocks).where(and(eq(blocks.profileId, profile.id), isNotNull(blocks.archivedAt))).orderBy(asc(blocks.position)),
    db.select().from(collections).where(and(eq(collections.profileId, profile.id), isNotNull(collections.archivedAt))).orderBy(asc(collections.position)),
    db.select({ blockId: analyticsEvents.blockId, clicks: sql<number>`count(*)` }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.profileId, profile.id), eq(analyticsEvents.eventType, "link_click")))
      .groupBy(analyticsEvents.blockId),
    db.select({ ruleKey: dismissedSuggestions.ruleKey }).from(dismissedSuggestions).where(eq(dismissedSuggestions.profileId, profile.id)),
    db.select({ provider: integrations.provider }).from(integrations).where(and(eq(integrations.profileId, profile.id), eq(integrations.enabled, true))),
    profile.themeId ? db.select().from(themes).where(eq(themes.id, profile.themeId)).limit(1).then(([row]) => row ?? null) : Promise.resolve(null),
  ]);
  const clickMap = new Map(clickRows.filter((row) => row.blockId).map((row) => [row.blockId!, Number(row.clicks)]));
  const themeConfig = (theme?.config as ThemeConfig) ?? (profile.designConfig as ThemeConfig) ?? {};

  return (
    <div>
      <LinksEditor
        profileId={profile.id}
        username={profile.username}
        initialProfile={{ displayName: profile.displayName ?? profile.username, bio: profile.bio ?? "", profileImage: profile.profileImage ?? "", showBranding: profile.showBranding, showFollowerTotal: profile.showFollowerTotal }}
        initialSocials={socials.map((social) => ({ ...social, followerSyncedAt: social.followerSyncedAt?.toISOString() ?? null }))}
        initialCollections={profileCollections.map((collection) => ({ ...collection, archivedAt: null }))}
        archivedItems={[
          ...archivedBlocks.map((block) => ({ kind: "block" as const, id: block.id, label: String((block.config as Record<string, unknown>).title ?? block.type) })),
          ...archivedCollections.map((collection) => ({ kind: "collection" as const, id: collection.id, label: collection.title })),
        ]}
        dismissedSuggestions={dismissed.map((row) => row.ruleKey)}
        connectedProviders={connected.map((row) => row.provider)}
        themeConfig={themeConfig}
        initialBlocks={profileBlocks.map((b) => ({
          id: b.id,
          type: b.type,
          position: b.position,
          enabled: b.enabled,
          config: b.config as Record<string, unknown>,
          collectionId: b.collectionId,
          clicks: clickMap.get(b.id) ?? 0,
        }))}
      />
    </div>
  );
}
