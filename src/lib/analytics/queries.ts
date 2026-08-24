import { and, between, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsDaily, analyticsEvents, blocks } from "@/lib/db/schema";
import type { DateRange } from "./events";

// ---------------------------------------------------------------------------
// Overview (sourced from analytics_daily for performance)
// ---------------------------------------------------------------------------

export type AnalyticsOverview = {
  totalViews: number;
  totalUniqueViews: number;
  totalClicks: number;
  totalLeads: number;
  totalPurchases: number;
  totalRevenue: string;
  /** CTR = clicks / views, expressed as 0–1. */
  clickThroughRate: number;
};

export async function getAnalyticsOverview(
  profileId: string,
  range: DateRange
): Promise<AnalyticsOverview> {
  const [row] = await db
    .select({
      views: sql<number>`COALESCE(SUM(${analyticsDaily.views}), 0)`,
      uniqueViews: sql<number>`COALESCE(SUM(${analyticsDaily.uniqueViews}), 0)`,
      clicks: sql<number>`COALESCE(SUM(${analyticsDaily.clicks}), 0)`,
      leads: sql<number>`COALESCE(SUM(${analyticsDaily.leads}), 0)`,
      purchases: sql<number>`COALESCE(SUM(${analyticsDaily.purchases}), 0)`,
      revenue: sql<string>`COALESCE(SUM(${analyticsDaily.revenue})::text, '0')`,
    })
    .from(analyticsDaily)
    .where(
      and(
        eq(analyticsDaily.profileId, profileId),
        gte(analyticsDaily.date, range.from),
        lte(analyticsDaily.date, range.to)
      )
    );

  const views = Number(row?.views ?? 0);
  const clicks = Number(row?.clicks ?? 0);

  return {
    totalViews: views,
    totalUniqueViews: Number(row?.uniqueViews ?? 0),
    totalClicks: clicks,
    totalLeads: Number(row?.leads ?? 0),
    totalPurchases: Number(row?.purchases ?? 0),
    totalRevenue: row?.revenue ?? "0",
    clickThroughRate: views > 0 ? clicks / views : 0,
  };
}

// ---------------------------------------------------------------------------
// Top links (sourced from raw events for accuracy)
// ---------------------------------------------------------------------------

export type TopLink = {
  blockId: string;
  clicks: number;
};

export async function getTopLinks(
  profileId: string,
  range: DateRange,
  limit = 10
): Promise<TopLink[]> {
  const rows = await db
    .select({
      blockId: analyticsEvents.blockId,
      clicks: sql<number>`COUNT(*)`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.profileId, profileId),
        eq(analyticsEvents.eventType, "link_click"),
        gte(analyticsEvents.timestamp, range.from),
        lte(analyticsEvents.timestamp, range.to)
      )
    )
    .groupBy(analyticsEvents.blockId)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit);

  return rows
    .filter((r) => r.blockId !== null)
    .map((r) => ({ blockId: r.blockId as string, clicks: Number(r.clicks) }));
}

// ---------------------------------------------------------------------------
// Traffic sources (referrer / UTM)
// ---------------------------------------------------------------------------

export type TrafficSource = {
  source: string;
  visits: number;
};

export async function getTrafficSources(
  profileId: string,
  range: DateRange,
  limit = 10
): Promise<TrafficSource[]> {
  const rows = await db
    .select({
      source: sql<string>`COALESCE(NULLIF(${analyticsEvents.utmSource}, ''), 'direct')`,
      visits: sql<number>`COUNT(*)`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.profileId, profileId),
        eq(analyticsEvents.eventType, "profile_view"),
        gte(analyticsEvents.timestamp, range.from),
        lte(analyticsEvents.timestamp, range.to)
      )
    )
    .groupBy(
      sql`COALESCE(NULLIF(${analyticsEvents.utmSource}, ''), 'direct')`
    )
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit);

  return rows.map((r) => ({ source: r.source, visits: Number(r.visits) }));
}

// ---------------------------------------------------------------------------
// Device breakdown
// ---------------------------------------------------------------------------

export type DeviceBreakdown = {
  device: string;
  count: number;
};

export async function getDeviceBreakdown(
  profileId: string,
  range: DateRange
): Promise<DeviceBreakdown[]> {
  const rows = await db
    .select({
      device: sql<string>`COALESCE(NULLIF(${analyticsEvents.device}, ''), 'unknown')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.profileId, profileId),
        gte(analyticsEvents.timestamp, range.from),
        lte(analyticsEvents.timestamp, range.to)
      )
    )
    .groupBy(sql`COALESCE(NULLIF(${analyticsEvents.device}, ''), 'unknown')`)
    .orderBy(desc(sql`COUNT(*)`));

  return rows.map((r) => ({ device: r.device, count: Number(r.count) }));
}
