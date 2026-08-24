/**
 * Allowlist-based HTML sanitizer for custom embeds.
 * Only permits <iframe> elements from trusted sources.
 * All script tags and other dangerous content are stripped.
 */

const ALLOWED_IFRAME_ORIGINS = [
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
  "vimeo.com",
  "player.vimeo.com",
  "spotify.com",
  "open.spotify.com",
  "soundcloud.com",
  "w.soundcloud.com",
  "music.apple.com",
  "embed.music.apple.com",
  "bandcamp.com",
  "anchor.fm",
  "podcasters.spotify.com",
  "buzzsprout.com",
  "simplecast.com",
  "transistor.fm",
  "google.com",
  "maps.google.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "platform.twitter.com",
  "publish.twitter.com",
];

function isAllowedOrigin(src: string): boolean {
  try {
    const url = new URL(src);
    return ALLOWED_IFRAME_ORIGINS.some(
      (origin) =>
        url.hostname === origin || url.hostname.endsWith(`.${origin}`),
    );
  } catch {
    return false;
  }
}

const IFRAME_ATTRS_ALLOWLIST = [
  "src",
  "title",
  "width",
  "height",
  "frameborder",
  "allow",
  "allowfullscreen",
  "style",
  "scrolling",
  "loading",
];

/**
 * Returns sanitized HTML safe for dangerouslySetInnerHTML.
 * Only <iframe> tags from allowed origins pass through.
 * Everything else is returned as an empty string.
 */
export function sanitizeEmbed(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  // Match a single <iframe ... /> or <iframe ...></iframe>
  const iframeMatch = trimmed.match(
    /^<iframe(\s[^>]*)?>(<\/iframe>)?$/i,
  );

  if (!iframeMatch) return "";

  const attrsString = iframeMatch[1] ?? "";

  // Extract src attribute
  const srcMatch = attrsString.match(/\bsrc=["']([^"']*)["']/i);
  if (!srcMatch) return "";

  const src = srcMatch[1];
  if (!isAllowedOrigin(src)) return "";

  // Rebuild iframe with only allowlisted attributes
  const attrRegex = /\b([\w-]+)=["']([^"']*)["']/gi;
  const safeAttrs: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(attrsString)) !== null) {
    const [, name, value] = match;
    if (IFRAME_ATTRS_ALLOWLIST.includes(name.toLowerCase())) {
      safeAttrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
    }
  }

  // Ensure safe defaults
  if (!safeAttrs.some((a) => a.startsWith("loading="))) {
    safeAttrs.push('loading="lazy"');
  }

  return `<iframe ${safeAttrs.join(" ")}></iframe>`;
}
