/**
 * Analytics event type constants and shared types.
 */

export const PROFILE_VIEW = "profile_view" as const;
export const LINK_CLICK = "link_click" as const;
export const LEAD_CAPTURE = "lead_capture" as const;
export const PURCHASE = "purchase" as const;
export const BLOCK_VIEW = "block_view" as const;
export const FORM_SUBMIT = "form_submit" as const;
export const VIDEO_PLAY = "video_play" as const;
export const DOWNLOAD = "download" as const;
export const SHARE = "share" as const;
export const QR_SCAN = "qr_scan" as const;

export type AnalyticsEventType =
  | typeof PROFILE_VIEW
  | typeof LINK_CLICK
  | typeof LEAD_CAPTURE
  | typeof PURCHASE
  | typeof BLOCK_VIEW
  | typeof FORM_SUBMIT
  | typeof VIDEO_PLAY
  | typeof DOWNLOAD
  | typeof SHARE
  | typeof QR_SCAN;

export type AnalyticsEventInput = {
  profileId: string;
  sessionId: string;
  /** Raw visitor identifier (will be hashed before storage). */
  visitorIdRaw: string;
  eventType: AnalyticsEventType;
  blockId?: string;
  metadata?: Record<string, unknown>;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  country?: string;
  region?: string;
  city?: string;
  device?: string;
  browser?: string;
  operatingSystem?: string;
};

export type DateRange = {
  from: Date;
  to: Date;
};
