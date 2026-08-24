import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { integrations, profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";
import { PixelsClient } from "./pixels-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pixels" };

const PIXEL_PROVIDERS = [
  "facebook_pixel",
  "google_analytics",
  "tiktok_pixel",
] as const;

export default async function PixelsPage() {
  const user = await getCurrentDbUser();
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (!profile) redirect("/onboarding");

  const canUse = await canUseFeature(user.id, "pixels");
  const rows = await db
    .select()
    .from(integrations)
    .where(eq(integrations.profileId, profile.id));

  const initial = rows
    .filter((r) =>
      (PIXEL_PROVIDERS as readonly string[]).includes(r.provider),
    )
    .map((r) => ({
      provider: r.provider,
      pixelId: String(
        (r.config as Record<string, unknown> | null)?.pixelId ?? "",
      ),
      enabled: r.enabled,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pixels</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect ad pixels that fire on your public bio page. Facebook and
          Instagram ads share the same Meta Pixel. Google and TikTok each use
          their own ID.
        </p>
      </div>
      <PixelsClient canUse={canUse} initial={initial} />
    </div>
  );
}
