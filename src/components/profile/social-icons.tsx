import {
  AtSign,
  Globe,
  Mail,
  MessageCircle,
  Music,
  Phone,
  MapPin,
  Share2,
  Video,
  type LucideIcon,
} from "lucide-react";

/**
 * Brand logos were removed from lucide-react v1 — use semantic generic icons
 * so we stay dependency-light and UI/UX Pro Max compliant (SVG only).
 */
const ICON_MAP: Record<string, LucideIcon> = {
  website: Globe,
  twitter: AtSign,
  x: AtSign,
  threads: AtSign,
  instagram: Share2,
  youtube: Video,
  github: Share2,
  linkedin: Share2,
  facebook: Share2,
  tiktok: Music,
  spotify: Music,
  soundcloud: Music,
  apple_music: Music,
  twitch: Video,
  discord: MessageCircle,
  telegram: MessageCircle,
  whatsapp: Phone,
  email: Mail,
  telephone: Phone,
  location: MapPin,
  pinterest: Share2,
  snapchat: Share2,
};

interface SocialIconsProps {
  links: { provider: string; url: string }[];
}

export function SocialIcons({ links }: SocialIconsProps) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {links.map((link) => {
        const Icon = ICON_MAP[link.provider.toLowerCase()] ?? Globe;
        return (
          <a
            key={`${link.provider}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            data-event="link_click"
            data-url={link.url}
            className="flex size-11 min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              color: "var(--bh-text-muted, var(--muted-foreground))",
            }}
            aria-label={link.provider}
          >
            <Icon className="size-5" aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
