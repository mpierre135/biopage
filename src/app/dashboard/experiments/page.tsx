import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  experimentVariants,
  experiments,
  profiles,
} from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";
import { ExperimentsClient } from "./experiments-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Experiments" };

export default async function ExperimentsPage() {
  const user = await getCurrentDbUser();
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (!profile) redirect("/onboarding");

  const canUse = await canUseFeature(user.id, "abTesting");
  const exps = await db
    .select()
    .from(experiments)
    .where(eq(experiments.profileId, profile.id));

  const initial = await Promise.all(
    exps.map(async (exp) => {
      const vars = await db
        .select()
        .from(experimentVariants)
        .where(eq(experimentVariants.experimentId, exp.id));
      return {
        id: exp.id,
        name: exp.name,
        status: exp.status,
        variants: vars.map((v) => ({
          id: v.id,
          name: v.name,
          impressions: v.impressions,
          conversions: v.conversions,
        })),
      };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Experiments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create A/B tests and track variant impressions.
        </p>
      </div>
      <ExperimentsClient canUse={canUse} initial={initial} />
    </div>
  );
}
