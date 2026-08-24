import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { features, planFeatures, plans, subscriptions } from "@/lib/db/schema";
import { FREE_FEATURES, type FeatureKey } from "./features";

type PlanInfo = {
  id: string;
  slug: string;
  name: string;
};

/**
 * Retrieves the active plan for a DB user ID.
 * Falls back to a synthetic "free" plan when no active subscription exists.
 */
export async function getUserPlan(userId: string): Promise<PlanInfo> {
  const [row] = await db
    .select({
      id: plans.id,
      slug: plans.slug,
      name: plans.name,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .orderBy(subscriptions.createdAt)
    .limit(1);

  if (row) return row;

  return { id: "free", slug: "free", name: "Free" };
}

/**
 * Returns `true` when the user's active plan includes the given feature key.
 *
 * Logic:
 *  1. Always grant features on the FREE_FEATURES allowlist.
 *  2. Look up the user's active subscription → plan → plan_features → features.
 *  3. Grant when a matching feature row exists with no limit (boolean toggle)
 *     or a positive limit_value.
 */
export async function canUseFeature(
  userId: string,
  key: FeatureKey
): Promise<boolean> {
  if (FREE_FEATURES.has(key)) return true;

  const plan = await getUserPlan(userId);
  if (plan.slug === "free") return false;

  const [row] = await db
    .select({ limitValue: planFeatures.limitValue })
    .from(planFeatures)
    .innerJoin(plans, eq(planFeatures.planId, plans.id))
    .innerJoin(features, eq(planFeatures.featureId, features.id))
    .innerJoin(
      subscriptions,
      and(
        eq(subscriptions.planId, plans.id),
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .where(eq(features.key, key))
    .limit(1);

  if (!row) return false;

  // limitValue of null means boolean toggle (unlimited); positive value means
  // the feature is available up to that limit.
  return row.limitValue === null || row.limitValue > 0;
}
