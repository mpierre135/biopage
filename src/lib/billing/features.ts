/**
 * Canonical set of feature keys used for entitlement checks throughout the
 * application. Always use these constants instead of raw strings.
 */
export const FEATURE_KEYS = [
  "removeBranding",
  "advancedAnalytics",
  "customThemes",
  "scheduledLinks",
  "leadCapture",
  "customDomain",
  "digitalProducts",
  "integrations",
  "pixels",
  "advancedRouting",
  "abTesting",
  "multipleProfiles",
  "teams",
  "csvExport",
  "qrCustomization",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** Human-readable labels for UI display. */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  removeBranding: "Remove Branding",
  advancedAnalytics: "Advanced Analytics",
  customThemes: "Custom Themes",
  scheduledLinks: "Scheduled Links",
  leadCapture: "Lead Capture",
  customDomain: "Custom Domain",
  digitalProducts: "Digital Products",
  integrations: "Third-party Integrations",
  pixels: "Tracking Pixels",
  advancedRouting: "Advanced Link Routing",
  abTesting: "A/B Testing",
  multipleProfiles: "Multiple Profiles",
  teams: "Team Collaboration",
  csvExport: "CSV Export",
  qrCustomization: "QR Code Customization",
};

/** Features available on the free plan (no subscription required). */
export const FREE_FEATURES = new Set<FeatureKey>([]);

/** Soft usage caps by plan slug (enforced in create actions). */
export const PLAN_LIMITS: Record<
  string,
  { profiles: number; blocks: number }
> = {
  free: { profiles: 1, blocks: 5 },
  creator: { profiles: 3, blocks: Number.POSITIVE_INFINITY },
  pro: { profiles: 10, blocks: Number.POSITIVE_INFINITY },
  business: { profiles: Number.POSITIVE_INFINITY, blocks: Number.POSITIVE_INFINITY },
};

export function getPlanLimits(slug: string) {
  return PLAN_LIMITS[slug] ?? PLAN_LIMITS.free;
}
