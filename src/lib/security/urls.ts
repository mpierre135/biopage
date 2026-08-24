/**
 * URL safety utilities: allow only http/https/mailto/tel schemes.
 * Rejects javascript:, data:, file:, vbscript:, and similar attack vectors.
 */

const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Returns true when the URL has an allowed scheme and can be safely rendered
 * in an anchor href without XSS risk.
 */
export function isSafeUrl(input: string | null | undefined): boolean {
  if (!input || typeof input !== "string") return false;

  const trimmed = input.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return SAFE_SCHEMES.has(url.protocol.toLowerCase());
  } catch {
    // Relative URLs without a scheme — only allow if they start with /
    return trimmed.startsWith("/") && !trimmed.startsWith("//");
  }
}

/**
 * Normalizes a URL and returns it if safe, or returns `null` when the URL
 * fails the safety check. Never throws.
 */
export function sanitizeUrl(input: string | null | undefined): string | null {
  if (!input || typeof input !== "string") return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const proto = url.protocol.toLowerCase();
    if (!SAFE_SCHEMES.has(proto)) return null;

    // Strip credentials for http/https
    if (proto === "http:" || proto === "https:") {
      url.username = "";
      url.password = "";
    }

    return url.toString();
  } catch {
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return trimmed;
    }
    return null;
  }
}
