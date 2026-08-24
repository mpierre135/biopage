import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { eq, and, asc } from "drizzle-orm";
import { Flag } from "lucide-react";
import { db } from "@/lib/db";
import { profiles, blocks, socialLinks, themes } from "@/lib/db/schema";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { SocialIcons } from "@/components/profile/social-icons";
import { themeToCssVars, cssVarsToStyle } from "@/lib/themes/resolver";
import { brandConfig } from "@/lib/brand";
import type { ThemeConfig } from "@/lib/themes/types";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.username, username.toLowerCase()))
    .limit(1);

  if (!profile) {
    return { title: "Not Found" };
  }

  const title =
    profile.seoTitle ||
    `${profile.displayName || profile.username} | ${brandConfig.name}`;
  const description =
    profile.seoDescription || profile.bio || brandConfig.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.socialSharingImage
        ? [{ url: profile.socialSharingImage }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.username, username.toLowerCase()),
        eq(profiles.isPublished, true),
      ),
    )
    .limit(1);

  if (!profile) notFound();
  if (profile.visibility === "private") notFound();

  const profileBlocks = await db
    .select()
    .from(blocks)
    .where(and(eq(blocks.profileId, profile.id), eq(blocks.enabled, true)))
    .orderBy(asc(blocks.position));

  const profileSocialLinks = await db
    .select({ provider: socialLinks.provider, url: socialLinks.url })
    .from(socialLinks)
    .where(
      and(eq(socialLinks.profileId, profile.id), eq(socialLinks.enabled, true)),
    )
    .orderBy(asc(socialLinks.position));

  let themeConfig: ThemeConfig = {};
  if (profile.themeId) {
    const [theme] = await db
      .select({ config: themes.config })
      .from(themes)
      .where(eq(themes.id, profile.themeId))
      .limit(1);
    if (theme?.config) {
      themeConfig = theme.config as ThemeConfig;
    }
  }

  const cssVars = themeToCssVars(themeConfig);
  const style = cssVarsToStyle(cssVars);

  const now = new Date();
  const visibleBlocks = profileBlocks.filter((b) => {
    if (b.publishAt && new Date(b.publishAt) > now) return false;
    if (b.expireAt && new Date(b.expireAt) < now) return false;
    return true;
  });

  const showSocialsTop = profile.socialIconPosition === "top";

  return (
    <div
      className="flex min-h-dvh flex-col items-center bg-[var(--bh-bg,hsl(var(--background)))] px-4 py-8 sm:py-12"
      style={style}
    >
      <div className="w-full" style={{ maxWidth: "var(--bh-max-width, 28rem)" }}>
        {/* Avatar */}
        {profile.profileImage && (
          <div className="mb-4 flex justify-center">
            <Image
              src={profile.profileImage}
              alt={profile.displayName || profile.username}
              width={96}
              height={96}
              className="rounded-full object-cover ring-2"
              style={{
                width: "var(--bh-avatar-size, 96px)",
                height: "var(--bh-avatar-size, 96px)",
                ["--tw-ring-color" as string]:
                  "var(--bh-avatar-ring, var(--border))",
              }}
              priority
            />
          </div>
        )}

        {/* Name */}
        {profile.displayName && (
          <h1
            className="text-center text-xl font-bold"
            style={{
              color: "var(--bh-text, hsl(var(--foreground)))",
              fontWeight: "var(--bh-heading-weight, 700)" as unknown as number,
            }}
          >
            {profile.displayName}
          </h1>
        )}

        {/* Bio */}
        {profile.bio && (
          <p
            className="mt-2 text-center text-sm leading-relaxed"
            style={{ color: "var(--bh-text-muted, hsl(var(--muted-foreground)))" }}
          >
            {profile.bio}
          </p>
        )}

        {/* Location */}
        {profile.location && (
          <p
            className="mt-1 text-center text-xs"
            style={{ color: "var(--bh-text-muted, hsl(var(--muted-foreground)))" }}
          >
            {profile.location}
          </p>
        )}

        {/* Social icons (top) */}
        {showSocialsTop && profileSocialLinks.length > 0 && (
          <div className="mt-4">
            <SocialIcons links={profileSocialLinks} />
          </div>
        )}

        {/* Blocks */}
        <div
          className="mt-6 flex flex-col"
          style={{ gap: "var(--bh-block-gap, 12px)" }}
        >
          {visibleBlocks.map((block) => (
            <BlockRenderer
              key={block.id}
              type={block.type}
              config={block.config}
              blockId={block.id}
              profileUsername={profile.username}
            />
          ))}
        </div>

        {/* Social icons (bottom) */}
        {!showSocialsTop && profileSocialLinks.length > 0 && (
          <div className="mt-6">
            <SocialIcons links={profileSocialLinks} />
          </div>
        )}

        {/* Branding */}
        {profile.showBranding && (
          <p className="mt-8 text-center text-xs text-muted-foreground/60">
            Powered by{" "}
            <a
              href={`https://${brandConfig.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:underline"
            >
              {brandConfig.name}
            </a>
          </p>
        )}

        {/* Report */}
        <div className="mt-4 flex justify-center">
          <a
            href={`mailto:${brandConfig.supportEmail}?subject=Report%20abuse%3A%20${encodeURIComponent(profile.username)}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
          >
            <Flag className="size-3" />
            Report abuse
          </a>
        </div>
      </div>

      <AnalyticsBeacon profileId={profile.id} />
    </div>
  );
}
