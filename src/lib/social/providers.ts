/**
 * Registry of supported social platforms.
 *
 * `urlPattern` is a RegExp that validates user-supplied URLs for that
 * provider. It is intentionally permissive — just enough to catch obvious
 * mistakes; the `isSafeUrl` check in security/urls.ts is the real gate.
 */

export type SocialProvider = {
  /** Unique key used in the database `provider` column. */
  key: string;
  /** Human-readable display label. */
  label: string;
  /** Icon identifier (maps to your icon library, e.g. Lucide or Simple Icons). */
  icon: string;
  /** Placeholder or example URL shown in the UI. */
  placeholder: string;
  /** Optional: validates the URL structure for this provider. */
  urlPattern?: RegExp;
  /** When true, the "URL" is actually an email address. */
  isEmail?: boolean;
  /** When true, the "URL" is a tel: link. */
  isPhone?: boolean;
};

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    key: "instagram",
    label: "Instagram",
    icon: "instagram",
    placeholder: "https://instagram.com/username",
    urlPattern: /instagram\.com\//i,
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: "tiktok",
    placeholder: "https://tiktok.com/@username",
    urlPattern: /tiktok\.com\//i,
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "youtube",
    placeholder: "https://youtube.com/@channel",
    urlPattern: /youtube\.com\//i,
  },
  {
    key: "x",
    label: "X (Twitter)",
    icon: "x",
    placeholder: "https://x.com/username",
    urlPattern: /(twitter|x)\.com\//i,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "linkedin",
    placeholder: "https://linkedin.com/in/username",
    urlPattern: /linkedin\.com\//i,
  },
  {
    key: "github",
    label: "GitHub",
    icon: "github",
    placeholder: "https://github.com/username",
    urlPattern: /github\.com\//i,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "facebook",
    placeholder: "https://facebook.com/username",
    urlPattern: /facebook\.com\//i,
  },
  {
    key: "pinterest",
    label: "Pinterest",
    icon: "pinterest",
    placeholder: "https://pinterest.com/username",
    urlPattern: /pinterest\.com\//i,
  },
  {
    key: "snapchat",
    label: "Snapchat",
    icon: "snapchat",
    placeholder: "https://snapchat.com/add/username",
    urlPattern: /snapchat\.com\//i,
  },
  {
    key: "twitch",
    label: "Twitch",
    icon: "twitch",
    placeholder: "https://twitch.tv/username",
    urlPattern: /twitch\.tv\//i,
  },
  {
    key: "discord",
    label: "Discord",
    icon: "discord",
    placeholder: "https://discord.gg/invite",
    urlPattern: /discord\.(gg|com)\//i,
  },
  {
    key: "substack",
    label: "Substack",
    icon: "substack",
    placeholder: "https://yourname.substack.com",
    urlPattern: /substack\.com/i,
  },
  {
    key: "medium",
    label: "Medium",
    icon: "medium",
    placeholder: "https://medium.com/@username",
    urlPattern: /medium\.com\//i,
  },
  {
    key: "patreon",
    label: "Patreon",
    icon: "patreon",
    placeholder: "https://patreon.com/username",
    urlPattern: /patreon\.com\//i,
  },
  {
    key: "spotify",
    label: "Spotify",
    icon: "spotify",
    placeholder: "https://open.spotify.com/artist/...",
    urlPattern: /spotify\.com\//i,
  },
  {
    key: "soundcloud",
    label: "SoundCloud",
    icon: "soundcloud",
    placeholder: "https://soundcloud.com/username",
    urlPattern: /soundcloud\.com\//i,
  },
  {
    key: "beehiiv",
    label: "Beehiiv",
    icon: "beehiiv",
    placeholder: "https://yourname.beehiiv.com",
    urlPattern: /beehiiv\.com/i,
  },
  {
    key: "email",
    label: "Email",
    icon: "mail",
    placeholder: "hello@example.com",
    isEmail: true,
  },
  {
    key: "phone",
    label: "Phone",
    icon: "phone",
    placeholder: "+1 (555) 000-0000",
    isPhone: true,
  },
  {
    key: "website",
    label: "Website",
    icon: "globe",
    placeholder: "https://yourwebsite.com",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: "whatsapp",
    placeholder: "https://wa.me/15550000000",
    urlPattern: /wa\.me\//i,
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: "send",
    placeholder: "https://t.me/username",
    urlPattern: /t\.me\//i,
  },
  {
    key: "threads",
    label: "Threads",
    icon: "at-sign",
    placeholder: "https://threads.net/@username",
    urlPattern: /threads\.net\//i,
  },
  {
    key: "bluesky",
    label: "Bluesky",
    icon: "cloud",
    placeholder: "https://bsky.app/profile/username",
    urlPattern: /bsky\.app\//i,
  },
];

/** Lookup map for O(1) access by key. */
export const SOCIAL_PROVIDER_MAP = new Map<string, SocialProvider>(
  SOCIAL_PROVIDERS.map((p) => [p.key, p])
);

export function getSocialProvider(key: string): SocialProvider | undefined {
  return SOCIAL_PROVIDER_MAP.get(key);
}
