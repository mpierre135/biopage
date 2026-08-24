import {
  Globe,
  Mail,
  Phone,
  Music,
  Music2,
  MessageCircle,
  Hash,
  User,
  Link,
  type LucideIcon,
} from "lucide-react";

export interface SocialProvider {
  id: string;
  label: string;
  icon: LucideIcon;
  baseUrl?: string;
  placeholder: string;
  color: string;
  prefixHandle?: boolean;
}

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    id: "instagram",
    label: "Instagram",
    icon: User,
    baseUrl: "https://instagram.com/",
    placeholder: "username",
    color: "#E1306C",
    prefixHandle: true,
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: Music,
    baseUrl: "https://tiktok.com/@",
    placeholder: "username",
    color: "#010101",
    prefixHandle: true,
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Music2,
    baseUrl: "https://youtube.com/@",
    placeholder: "channel or @handle",
    color: "#FF0000",
  },
  {
    id: "x",
    label: "X (Twitter)",
    icon: Hash,
    baseUrl: "https://x.com/",
    placeholder: "username",
    color: "#000000",
    prefixHandle: true,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: User,
    baseUrl: "https://facebook.com/",
    placeholder: "username or page",
    color: "#1877F2",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Link,
    baseUrl: "https://linkedin.com/in/",
    placeholder: "username",
    color: "#0A66C2",
  },
  {
    id: "threads",
    label: "Threads",
    icon: Hash,
    baseUrl: "https://threads.net/@",
    placeholder: "username",
    color: "#000000",
    prefixHandle: true,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    icon: Globe,
    baseUrl: "https://pinterest.com/",
    placeholder: "username",
    color: "#E60023",
  },
  {
    id: "snapchat",
    label: "Snapchat",
    icon: MessageCircle,
    baseUrl: "https://snapchat.com/add/",
    placeholder: "username",
    color: "#FFFC00",
  },
  {
    id: "discord",
    label: "Discord",
    icon: MessageCircle,
    baseUrl: "https://discord.gg/",
    placeholder: "invite code or server",
    color: "#5865F2",
  },
  {
    id: "twitch",
    label: "Twitch",
    icon: Music2,
    baseUrl: "https://twitch.tv/",
    placeholder: "username",
    color: "#9146FF",
  },
  {
    id: "spotify",
    label: "Spotify",
    icon: Music,
    baseUrl: "https://open.spotify.com/user/",
    placeholder: "profile URL",
    color: "#1DB954",
  },
  {
    id: "soundcloud",
    label: "SoundCloud",
    icon: Music,
    baseUrl: "https://soundcloud.com/",
    placeholder: "username",
    color: "#FF5500",
  },
  {
    id: "apple_music",
    label: "Apple Music",
    icon: Music,
    placeholder: "profile or artist URL",
    color: "#FC3C44",
  },
  {
    id: "github",
    label: "GitHub",
    icon: Link,
    baseUrl: "https://github.com/",
    placeholder: "username",
    color: "#181717",
    prefixHandle: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    baseUrl: "https://wa.me/",
    placeholder: "phone number with country code",
    color: "#25D366",
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: MessageCircle,
    baseUrl: "https://t.me/",
    placeholder: "username",
    color: "#26A5E4",
    prefixHandle: true,
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
    baseUrl: "mailto:",
    placeholder: "you@example.com",
    color: "#EA4335",
  },
  {
    id: "telephone",
    label: "Phone",
    icon: Phone,
    baseUrl: "tel:",
    placeholder: "+1 (555) 000-0000",
    color: "#34A853",
  },
  {
    id: "website",
    label: "Website",
    icon: Globe,
    placeholder: "https://yoursite.com",
    color: "#6366F1",
  },
];

export const SOCIAL_PROVIDER_MAP = new Map(
  SOCIAL_PROVIDERS.map((p) => [p.id, p]),
);

export function getSocialProvider(id: string): SocialProvider | undefined {
  return SOCIAL_PROVIDER_MAP.get(id);
}
