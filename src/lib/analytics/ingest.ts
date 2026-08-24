import crypto from "crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsDaily, analyticsEvents } from "@/lib/db/schema";
import {
  LEAD_CAPTURE,
  LINK_CLICK,
  PROFILE_VIEW,
  PURCHASE,
  type AnalyticsEventInput,
} from "./events";

/**
 * Deterministically hashes a raw visitor ID (IP + UA fingerprint, etc.)
 * so we never store PII in the analytics tables.
 */
function hashVisitorId(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 64);
}

/**
 * Truncates a Date to midnight UTC — used as the partition key for daily
 * aggregate rows.
 */
function toUtcDay(d: Date): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

/**
 * Ingests a single analytics event:
 *  1. Inserts into `analytics_events` (raw ledger).
 *  2. Upserts `analytics_daily` counters for that profile × date.
 */
export async function ingestEvent(input: AnalyticsEventInput): Promise<void> {
  const visitorId = hashVisitorId(input.visitorIdRaw);
  const now = new Date();
  const day = toUtcDay(now);

  await db.insert(analyticsEvents).values({
    profileId: input.profileId,
    sessionId: input.sessionId,
    visitorId,
    eventType: input.eventType,
    blockId: input.blockId ?? null,
    metadata: input.metadata ?? {},
    referrer: input.referrer ?? null,
    utmSource: input.utmSource ?? null,
    utmMedium: input.utmMedium ?? null,
    utmCampaign: input.utmCampaign ?? null,
    utmTerm: input.utmTerm ?? null,
    utmContent: input.utmContent ?? null,
    country: input.country ?? null,
    region: input.region ?? null,
    city: input.city ?? null,
    device: input.device ?? null,
    browser: input.browser ?? null,
    operatingSystem: input.operatingSystem ?? null,
    timestamp: now,
  });

  // Determine which daily counters to increment
  const isView = input.eventType === PROFILE_VIEW;
  const isClick = input.eventType === LINK_CLICK;
  const isLead = input.eventType === LEAD_CAPTURE;
  const isPurchase = input.eventType === PURCHASE;

  await db
    .insert(analyticsDaily)
    .values({
      profileId: input.profileId,
      date: day,
      views: isView ? 1 : 0,
      uniqueViews: 0,
      clicks: isClick ? 1 : 0,
      uniqueClicks: 0,
      leads: isLead ? 1 : 0,
      purchases: isPurchase ? 1 : 0,
      revenue: "0",
    })
    .onConflictDoUpdate({
      target: [analyticsDaily.profileId, analyticsDaily.date],
      set: {
        views: sql`${analyticsDaily.views} + ${isView ? 1 : 0}`,
        clicks: sql`${analyticsDaily.clicks} + ${isClick ? 1 : 0}`,
        leads: sql`${analyticsDaily.leads} + ${isLead ? 1 : 0}`,
        purchases: sql`${analyticsDaily.purchases} + ${isPurchase ? 1 : 0}`,
      },
    });
}
