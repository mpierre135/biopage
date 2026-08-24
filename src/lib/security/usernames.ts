/**
 * Username validation and normalization.
 *
 * Rules:
 *  - 3–30 characters
 *  - Lowercase alphanumeric, underscore, or hyphen
 *  - Must start and end with alphanumeric
 *  - Cannot collide with reserved app paths
 */

export const USERNAME_REGEX = /^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$|^[a-z0-9]{3}$/;

/**
 * Paths that are reserved by the application and must not be used as usernames.
 * Stored in lowercase; comparison is always case-insensitive.
 */
export const RESERVED_USERNAMES = new Set<string>([
  // App routes
  "dashboard",
  "admin",
  "api",
  "login",
  "logout",
  "signup",
  "sign-in",
  "sign-up",
  "register",
  "pricing",
  "features",
  "templates",
  "settings",
  "onboarding",
  "profile",
  "account",
  "billing",
  "support",
  "help",
  "contact",
  "about",
  "blog",
  "press",
  "careers",
  "legal",
  "privacy",
  "terms",
  "security",
  "status",
  "changelog",
  "roadmap",
  "docs",
  "documentation",
  // Functional paths
  "x",
  "collect",
  "download",
  "webhook",
  "webhooks",
  "callback",
  "oauth",
  "auth",
  "verify",
  "invite",
  "reset",
  "confirm",
  "unsubscribe",
  "redirect",
  // Reserved brand names
  "biohub",
  "biopage",
  "root",
  "null",
  "undefined",
  "anonymous",
  "guest",
  "system",
  "bot",
  "www",
  "mail",
  "email",
  "smtp",
  "ftp",
  "cdn",
  "static",
  "assets",
  "media",
  "uploads",
  "public",
  "private",
  "internal",
  "test",
  "testing",
  "demo",
  "example",
]);

/**
 * Normalizes a raw username string: trims whitespace and lowercases.
 */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export type UsernameValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Validates a normalized username (call `normalizeUsername` first).
 */
export function validateUsername(username: string): UsernameValidationResult {
  if (!username || username.length < 3) {
    return { valid: false, reason: "Username must be at least 3 characters." };
  }

  if (username.length > 30) {
    return { valid: false, reason: "Username must be at most 30 characters." };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      reason:
        "Username may only contain lowercase letters, numbers, hyphens, and underscores, and must start and end with a letter or number.",
    };
  }

  if (RESERVED_USERNAMES.has(username)) {
    return { valid: false, reason: "That username is reserved." };
  }

  return { valid: true };
}
