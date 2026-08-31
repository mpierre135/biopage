import { z } from "zod";
import { USERNAME_REGEX, validateUsername, normalizeUsername } from "@/lib/security/usernames";
import { isSafeUrl } from "@/lib/security/urls";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters.")
  .max(30, "Username must be at most 30 characters.")
  .transform(normalizeUsername)
  .superRefine((val, ctx) => {
    const result = validateUsername(val);
    if (!result.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.reason,
      });
    }
  });

const safeUrlSchema = z
  .string()
  .url("Must be a valid URL.")
  .refine(isSafeUrl, "URL scheme is not allowed.");

const optionalSafeUrlSchema = z
  .string()
  .max(2048, "URL is too long.")
  .refine((v) => !v || isSafeUrl(v), "URL scheme is not allowed.")
  .optional()
  .or(z.literal(""));

// ---------------------------------------------------------------------------
// Profile update
// ---------------------------------------------------------------------------

export const profileUpdateSchema = z.object({
  username: usernameSchema.optional(),
  displayName: z.string().max(120, "Display name is too long.").optional(),
  bio: z.string().max(500, "Bio must be 500 characters or fewer.").optional(),
  location: z.string().max(160, "Location is too long.").optional(),
  profileImage: optionalSafeUrlSchema,
  heroImage: optionalSafeUrlSchema,
  profileVideo: optionalSafeUrlSchema,
  seoTitle: z.string().max(160, "SEO title is too long.").optional(),
  seoDescription: z.string().max(320, "SEO description is too long.").optional(),
  socialSharingImage: optionalSafeUrlSchema,
  customDomain: z
    .string()
    .max(255, "Domain is too long.")
    .regex(
      /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i,
      "Invalid domain format."
    )
    .optional()
    .or(z.literal("")),
  visibility: z.enum(["public", "unlisted", "private"]).optional(),
  isPublished: z.boolean().optional(),
  showBranding: z.boolean().optional(),
  socialIconPosition: z.enum(["top", "bottom"]).optional(),
  showFollowerTotal: z.boolean().optional(),
  themeId: z.string().uuid().nullable().optional(),
  designConfig: z.record(z.string(), z.unknown()).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ---------------------------------------------------------------------------
// Block create/update
// ---------------------------------------------------------------------------

const BLOCK_TYPES = [
  "LINK",
  "HEADER",
  "TEXT",
  "IMAGE",
  "VIDEO",
  "YOUTUBE",
  "VIMEO",
  "SPOTIFY",
  "APPLE_MUSIC",
  "SOUNDCLOUD",
  "SOCIAL",
  "EMAIL_CAPTURE",
  "SMS_CAPTURE",
  "FORM",
  "CONTACT",
  "PRODUCT",
  "DIGITAL_PRODUCT",
  "COURSE",
  "BOOKING",
  "DONATION",
  "GALLERY",
  "CAROUSEL",
  "MAP",
  "COUNTDOWN",
  "FAQ",
  "TESTIMONIAL",
  "DIVIDER",
  "CUSTOM_EMBED",
] as const;

export const blockConfigSchema = z.record(z.string(), z.unknown());

export const blockCreateSchema = z.object({
  type: z.enum(BLOCK_TYPES),
  position: z.number().int().min(0).optional(),
  enabled: z.boolean().default(true),
  config: blockConfigSchema.default({}),
  publishAt: z.coerce.date().optional(),
  expireAt: z.coerce.date().optional(),
  timezone: z.string().max(64).optional(),
  collectionId: z.string().uuid().nullable().optional(),
});

export type BlockCreateInput = z.infer<typeof blockCreateSchema>;

export const blockUpdateSchema = z.object({
  position: z.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
  config: blockConfigSchema.optional(),
  publishAt: z.coerce.date().nullable().optional(),
  expireAt: z.coerce.date().nullable().optional(),
  timezone: z.string().max(64).nullable().optional(),
  collectionId: z.string().uuid().nullable().optional(),
});

export type BlockUpdateInput = z.infer<typeof blockUpdateSchema>;

// ---------------------------------------------------------------------------
// Social link
// ---------------------------------------------------------------------------

export const socialLinkSchema = z.object({
  provider: z.string().min(1).max(64),
  url: z.string().max(2048).refine(isSafeUrl, "URL scheme is not allowed."),
  position: z.number().int().min(0).optional(),
  enabled: z.boolean().default(true),
  followerCount: z.number().int().min(0).nullable().optional(),
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
