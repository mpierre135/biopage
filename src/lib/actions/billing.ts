"use server";

import { eq, and, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans, features, planFeatures, subscriptions, users } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";

export async function getPlansWithFeatures() {
  const allPlans = await db
    .select()
    .from(plans)
    .where(eq(plans.isActive, true))
    .orderBy(asc(plans.sortOrder));

  const allFeatures = await db.select().from(features);
  const allPlanFeatures = await db.select().from(planFeatures);

  return allPlans.map((plan) => {
    const pf = allPlanFeatures.filter((pf) => pf.planId === plan.id);
    const featureList = pf.map((pf) => {
      const feature = allFeatures.find((f) => f.id === pf.featureId);
      return {
        key: feature?.key ?? "",
        name: feature?.name ?? "",
        description: feature?.description ?? "",
        limitValue: pf.limitValue,
      };
    });

    return {
      ...plan,
      features: featureList,
    };
  });
}

export async function getCurrentSubscription() {
  const user = await getCurrentDbUser();

  const [sub] = await db
    .select({
      id: subscriptions.id,
      planId: subscriptions.planId,
      status: subscriptions.status,
      billingInterval: subscriptions.billingInterval,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
      planName: plans.name,
      planSlug: plans.slug,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(
      and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.status, "active"),
      ),
    )
    .limit(1);

  return sub ?? null;
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require("stripe") as typeof import("stripe").default;
  return new Stripe(key);
}

export async function createCheckoutSession(
  planSlug: string,
  interval: "monthly" | "annual",
) {
  const stripe = getStripe();
  if (!stripe) {
    return {
      success: false as const,
      error: "Payments are not configured yet. Please try again later.",
    };
  }

  const user = await getCurrentDbUser();

  const [plan] = await db
    .select()
    .from(plans)
    .where(and(eq(plans.slug, planSlug), eq(plans.isActive, true)))
    .limit(1);

  if (!plan) {
    return { success: false as const, error: "Plan not found" };
  }

  const priceId =
    interval === "annual" ? plan.stripeAnnualPriceId : plan.stripeMonthlyPriceId;

  if (!priceId) {
    return {
      success: false as const,
      error: "This plan is not available for purchase yet.",
    };
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, user.id));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    metadata: { userId: user.id, planSlug },
  });

  return { success: true as const, url: session.url };
}
