import { notFound } from "next/navigation";
import { eq, asc, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  profiles,
  blocks,
  socialLinks,
  themes,
  integrations,
  experiments,
  experimentVariants,
} from "@/lib/db/schema";
import { themeToCssVars, cssVarsToStyle, buildPageBackgroundStyle, backgroundOverlayStyle } from "@/lib/themes/resolver";
import { brandConfig } from "@/lib/brand";
import { ProfileView } from "@/components/public/profile-view";
import { AnalyticsBeacon } from "@/components/public/analytics-beacon";
import {
  TrackingPixels,
  type TrackingPixel,
} from "@/components/public/tracking-pixels";
import type { Metadata } from "next";
import type { ThemeConfig } from "@/lib/themes/types";

type Props = {
  params: Promise<{ username: string }>;
};

const PIXEL_PROVIDERS = new Set([
  "facebook_pixel",
  "google_analytics",
  "tiktok_pixel",
]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const [profile] = await db
    .select({
      displayName: profiles.displayName,
      bio: profiles.bio,
      seoTitle: profiles.seoTitle,
      seoDescription: profiles.seoDescription,
      socialSharingImage: profiles.socialSharingImage,
      profileImage: profiles.profileImage,
    })
    .from(profiles)
    .where(eq(profiles.username, username.toLowerCase()))
    .limit(1);

  if (!profile) return { title: "Not Found" };

  const title = profile.seoTitle ?? profile.displayName ?? `@${username}`;
  const description =
    profile.seoDescription ?? profile.bio ?? `${title} on ${brandConfig.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.socialSharingImage
        ? [profile.socialSharingImage]
        : profile.profileImage
          ? [profile.profileImage]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function UsernamePage({ params }: Props) {
  const { username } = await params;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.username, username.toLowerCase()),
        eq(profiles.isPublished, true),
        eq(profiles.visibility, "public"),
      ),
    )
    .limit(1);

  if (!profile) notFound();

  const [profileBlocks, profileSocials, profileTheme, pixelRows, runningExp] =
    await Promise.all([
      db
        .select()
        .from(blocks)
        .where(and(eq(blocks.profileId, profile.id), eq(blocks.enabled, true)))
        .orderBy(asc(blocks.position)),
      db
        .select()
        .from(socialLinks)
        .where(
          and(
            eq(socialLinks.profileId, profile.id),
            eq(socialLinks.enabled, true),
          ),
        )
        .orderBy(asc(socialLinks.position)),
      profile.themeId
        ? db
            .select()
            .from(themes)
            .where(eq(themes.id, profile.themeId))
            .limit(1)
            .then((rows) => rows[0] ?? null)
        : Promise.resolve(null),
      db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.profileId, profile.id),
            eq(integrations.enabled, true),
          ),
        ),
      db
        .select()
        .from(experiments)
        .where(
          and(
            eq(experiments.profileId, profile.id),
            eq(experiments.status, "running"),
          ),
        )
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ]);

  if (runningExp) {
    const variants = await db
      .select()
      .from(experimentVariants)
      .where(eq(experimentVariants.experimentId, runningExp.id));
    if (variants.length > 0) {
      const pick = variants[Math.floor(Math.random() * variants.length)];
      await db
        .update(experimentVariants)
        .set({ impressions: sql`${experimentVariants.impressions} + 1` })
        .where(eq(experimentVariants.id, pick.id));
    }
  }

  const now = new Date();
  const visibleBlocks = profileBlocks.filter((b) => {
    if (b.publishAt && b.publishAt > now) return false;
    if (b.expireAt && b.expireAt <= now) return false;
    return true;
  });

  const themeConfig = (profileTheme?.config as ThemeConfig) ??
    (profile.designConfig as ThemeConfig) ??
    {};
  const cssVars = themeToCssVars(themeConfig);
  const style = {
    ...cssVarsToStyle(cssVars),
    ...buildPageBackgroundStyle(themeConfig),
  };
  const overlay = backgroundOverlayStyle(themeConfig);

  const pixels: TrackingPixel[] = pixelRows
    .filter((r) => PIXEL_PROVIDERS.has(r.provider))
    .map((r) => ({
      provider: r.provider as TrackingPixel["provider"],
      pixelId: String(
        (r.config as Record<string, unknown> | null)?.pixelId ?? "",
      ),
    }))
    .filter((p) => p.pixelId.length > 0);

  return (
    <div className="relative min-h-screen" style={style}>
      {overlay ? (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={overlay}
          aria-hidden
        />
      ) : null}
      <div className="relative z-10">
        <ProfileView
          profile={{
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            bio: profile.bio,
            profileImage: profile.profileImage,
            showBranding: profile.showBranding,
          }}
          blocks={visibleBlocks.map((b) => ({
            id: b.id,
            type: b.type,
            config: b.config as Record<string, unknown>,
          }))}
          socials={profileSocials.map((s) => ({
            id: s.id,
            provider: s.provider,
            url: s.url,
          }))}
          themeConfig={themeConfig}
        />
      </div>
      <AnalyticsBeacon profileId={profile.id} />
      <TrackingPixels pixels={pixels} />
    </div>
  );
}
