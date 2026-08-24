import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ingestEvent } from "@/lib/analytics/ingest";
import type { AnalyticsEventType } from "@/lib/analytics/events";

const collectSchema = z.object({
  profileId: z.string().uuid(),
  eventType: z.string().min(1).max(64),
  blockId: z.string().uuid().optional(),
  sessionId: z.string().min(1).max(128),
  visitorIdRaw: z.string().min(1).max(256),
  referrer: z.string().max(2048).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
  utmTerm: z.string().max(120).optional(),
  utmContent: z.string().max(120).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = collectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 },
      );
    }

    const ua = req.headers.get("user-agent") ?? "";
    const geo = req.headers.get("x-vercel-ip-country") ?? undefined;

    await ingestEvent({
      profileId: parsed.data.profileId,
      eventType: parsed.data.eventType as AnalyticsEventType,
      blockId: parsed.data.blockId,
      sessionId: parsed.data.sessionId,
      visitorIdRaw: parsed.data.visitorIdRaw,
      referrer: parsed.data.referrer,
      utmSource: parsed.data.utmSource,
      utmMedium: parsed.data.utmMedium,
      utmCampaign: parsed.data.utmCampaign,
      utmTerm: parsed.data.utmTerm,
      utmContent: parsed.data.utmContent,
      metadata: parsed.data.metadata,
      country: geo,
      device: ua ? undefined : undefined,
      browser: undefined,
      operatingSystem: undefined,
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
