import { notFound } from "next/navigation";
import { eq, asc, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, blocks, socialLinks, themes } from "@/lib/db/schema";
import { themeToCssVars, cssVarsToStyle } from "@/lib/themes/resolver";
import { brandConfig } from "@/lib/brand";
import { ProfileView } from "@/components/public/profile-view";
import { AnalyticsBeacon } from "@/components/public/analytics-beacon";
import type { Metadata } from "next";
import type { ThemeConfig } from "@/lib/themes/types";

type Props = {
  params: Promise<{ username: string }>;
};

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

  const [profileBlocks, profileSocials, profileTheme] = await Promise.all([
    db
      .select()
      .from(blocks)
      .where(and(eq(blocks.profileId, profile.id), eq(blocks.enabled, true)))
      .orderBy(asc(blocks.position)),
    db
      .select()
      .from(socialLinks)
      .where(and(eq(socialLinks.profileId, profile.id), eq(socialLinks.enabled, true)))
      .orderBy(asc(socialLinks.position)),
    profile.themeId
      ? db
          .select()
          .from(themes)
          .where(eq(themes.id, profile.themeId))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
  ]);

  const themeConfig = (profileTheme?.config as ThemeConfig) ??
    (profile.designConfig as ThemeConfig) ??
    {};
  const cssVars = themeToCssVars(themeConfig);
  const style = cssVarsToStyle(cssVars);

  const bgColor = themeConfig.background?.color ?? "#ffffff";
  const bgGradient = themeConfig.background?.gradient;

  return (
    <div
      className="min-h-screen"
      style={{
        ...style,
        background: bgGradient ?? bgColor,
        color: themeConfig.colors?.text ?? "#1e293b",
        fontFamily: themeConfig.typography?.family ?? "inherit",
      }}
    >
      <ProfileView
        profile={{
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          bio: profile.bio,
          profileImage: profile.profileImage,
          showBranding: profile.showBranding,
        }}
        blocks={profileBlocks.map((b) => ({
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
      <AnalyticsBeacon profileId={profile.id} />
    </div>
  );
}
