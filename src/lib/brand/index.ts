export const brandConfig = {
  name: "BioHub",
  domain: "biohub.com",
  tagline: "Everything you are. One link.",
  description:
    "The creator growth operating system built around one permanent public URL.",
  supportEmail: "support@biohub.com",
  twitterHandle: "@biohub",
} as const;

export type BrandConfig = typeof brandConfig;
