import Image from "next/image";
import {
  Globe,
  Mail,
  Phone,
  AtSign,
  Cloud,
  Send,
  Music,
  Headphones,
  Bookmark,
  MessageCircle,
  Camera,
  Link2,
  ExternalLink,
  Play,
  Video,
  Rss,
} from "lucide-react";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { brandConfig } from "@/lib/brand";
import { getSocialProvider } from "@/lib/social/providers";
import type { BlockType } from "@/lib/blocks/types";
import type { ThemeConfig } from "@/lib/themes/types";
import { getFollowerTotal } from "@/lib/editor/rules";

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe,
  mail: Mail,
  phone: Phone,
  github: ExternalLink,
  youtube: Play,
  instagram: Camera,
  facebook: Globe,
  linkedin: Link2,
  x: AtSign,
  "at-sign": AtSign,
  cloud: Cloud,
  send: Send,
  spotify: Music,
  soundcloud: Headphones,
  substack: Bookmark,
  discord: MessageCircle,
  snapchat: Camera,
  tiktok: Video,
  pinterest: Bookmark,
  twitch: Headphones,
  medium: Rss,
  patreon: Bookmark,
  beehiiv: Bookmark,
  whatsapp: MessageCircle,
  telegram: Send,
  threads: AtSign,
  bluesky: Cloud,
};

function SocialIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const Icon = SOCIAL_ICON_MAP[iconKey] ?? Globe;
  return <Icon className={className} />;
}

type ProfileData = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  profileImage: string | null;
  showBranding: boolean;
  showFollowerTotal?: boolean;
};

type BlockData = {
  id: string;
  type: string;
  config: Record<string, unknown>;
  position?: number;
  collectionId?: string | null;
};

type SocialData = {
  id: string;
  provider: string;
  url: string;
  followerCount?: number | null;
  position?: number;
};

type CollectionData = {
  id: string;
  title: string;
  position: number;
  enabled?: boolean;
};

type ProfileViewProps = {
  profile: ProfileData;
  blocks: BlockData[];
  socials: SocialData[];
  themeConfig: ThemeConfig;
  collections?: CollectionData[];
  preview?: boolean;
};

export function ProfileView({
  profile,
  blocks,
  socials,
  themeConfig,
  collections = [],
  preview = false,
}: ProfileViewProps) {
  const avatarSize = themeConfig.layout?.avatarSize ?? "96px";
  const maxWidth = themeConfig.layout?.containerMaxWidth ?? "28rem";
  const blockGap = themeConfig.layout?.blockGap ?? "12px";
  const textColor = themeConfig.colors?.text ?? "#1e293b";
  const textMuted = themeConfig.colors?.textMuted ?? "#64748b";
  const primaryColor = themeConfig.colors?.primary ?? "#6366f1";
  const totalFollowers = getFollowerTotal(socials);
  const topLevel = [
    ...blocks.filter((block) => !block.collectionId).map((block) => ({ kind: "block" as const, id: block.id, position: block.position ?? 0 })),
    ...collections.map((collection) => ({ kind: "collection" as const, id: collection.id, position: collection.position })),
  ].sort((a, b) => a.position - b.position);

  return (
    <div
      className="mx-auto px-4 py-8"
      style={{ maxWidth }}
    >
      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center">
        {profile.profileImage && (
          <div
            className="relative overflow-hidden rounded-full"
            style={{
              width: avatarSize,
              height: avatarSize,
              ...(themeConfig.layout?.avatarRing
                ? {
                    border: `3px solid ${themeConfig.layout.avatarRingColor ?? primaryColor}`,
                  }
                : {}),
            }}
          >
            <Image
              src={profile.profileImage}
              alt={profile.displayName ?? profile.username}
              fill
              className="object-cover"
              sizes={avatarSize}
            />
          </div>
        )}

        <h1
          className="mt-4 text-xl font-bold"
          style={{
            color: textColor,
            fontWeight: themeConfig.typography?.headingWeight ?? 700,
          }}
        >
          {profile.displayName ?? `@${profile.username}`}
        </h1>

        {profile.bio && (
          <p
            className="mt-2 max-w-sm text-sm leading-relaxed"
            style={{ color: textMuted }}
          >
            {profile.bio}
          </p>
        )}
        {profile.showFollowerTotal && totalFollowers > 0 && (
          <p className="mt-2 text-xs font-medium" style={{ color: textMuted }}>
            {new Intl.NumberFormat("en-US", { notation: "compact" }).format(totalFollowers)} followers
          </p>
        )}
      </div>

      {/* Social links */}
      {socials.length > 0 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {socials.map((social) => {
            const provider = getSocialProvider(social.provider);
            return (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-9 items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-80 cursor-pointer"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                aria-label={provider?.label ?? social.provider}
              >
                <SocialIcon iconKey={social.provider} className="size-4" />
              </a>
            );
          })}
        </div>
      )}

      {/* Blocks */}
      <div className="mt-6" style={{ display: "flex", flexDirection: "column", gap: blockGap }}>
        {topLevel.map((item) => {
          if (item.kind === "block") {
            const block = blocks.find((candidate) => candidate.id === item.id);
            return block ? (
              <div key={block.id} className={preview ? "pointer-events-none" : undefined}>
                <BlockRenderer type={block.type as BlockType} config={block.config} blockId={block.id} profileUsername={profile.username} />
              </div>
            ) : null;
          }
          const collection = collections.find((candidate) => candidate.id === item.id);
          if (!collection || collection.enabled === false) return null;
          const members = blocks.filter((block) => block.collectionId === collection.id).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
          return (
            <section key={collection.id} className="overflow-hidden rounded-[var(--bh-card-radius,16px)] border border-[var(--bh-card-border,#e5e7eb)] bg-[var(--bh-card-bg,#fff)] p-3 shadow-[var(--bh-card-shadow,none)]">
              <h2 className="px-2 py-3 text-center text-sm font-semibold" style={{ color: textColor }}>{collection.title}</h2>
              <div className="grid gap-3">
                {members.map((block) => (
                  <div key={block.id} className={preview ? "pointer-events-none" : undefined}>
                    <BlockRenderer type={block.type as BlockType} config={block.config} blockId={block.id} profileUsername={profile.username} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Branding */}
      {profile.showBranding && (
        <div className="mt-8 pb-4 text-center">
          <a
            href={`https://${brandConfig.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-opacity duration-200 hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: `${textMuted}10`,
              color: textMuted,
            }}
          >
            Powered by {brandConfig.name}
          </a>
        </div>
      )}
    </div>
  );
}
