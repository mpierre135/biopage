import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import {
  subscriptions,
  plans,
  users,
  products,
  orders,
  orderItems,
  digitalFiles,
  downloadTokens,
} from "@/lib/db/schema";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require("stripe") as typeof import("stripe").default;
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();

  if (!stripe) {
    console.warn("[stripe-webhook] STRIPE_SECRET_KEY not set — ignoring webhook");
    return NextResponse.json({ warning: "Stripe not configured" });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook verification failed: ${message}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        await syncSubscription(sub);
      } else if (session.mode === "payment") {
        await fulfillProductPurchase(session);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await syncSubscription(sub);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncSubscription(sub: any) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

  if (!customerId) return;

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) return;

  const priceId = sub.items?.data?.[0]?.price?.id;
  if (!priceId) return;

  const [plan] = await db
    .select({ id: plans.id })
    .from(plans)
    .where(
      eq(plans.stripeMonthlyPriceId, priceId),
    )
    .limit(1)
    .then(async (rows) => {
      if (rows.length > 0) return rows;
      return db
        .select({ id: plans.id })
        .from(plans)
        .where(eq(plans.stripeAnnualPriceId, priceId))
        .limit(1);
    });

  if (!plan) return;

  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "incomplete",
    unpaid: "unpaid",
    incomplete_expired: "canceled",
  };

  const status = statusMap[sub.status] ?? "canceled";
  const interval = sub.items?.data?.[0]?.price?.recurring?.interval === "year"
    ? "annual"
    : "monthly";

  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, user.id),
        eq(subscriptions.stripeSubscriptionId, sub.id),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        planId: plan.id,
        status,
        billingInterval: interval,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      })
      .where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      userId: user.id,
      planId: plan.id,
      status,
      billingInterval: interval,
      stripeSubscriptionId: sub.id,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fulfillProductPurchase(session: any) {
  const productId = session.metadata?.productId as string | undefined;
  const profileId = session.metadata?.profileId as string | undefined;
  if (!productId || !profileId) return;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) return;

  const email =
    session.customer_details?.email ??
    session.customer_email ??
    "buyer@unknown";

  const [order] = await db
    .insert(orders)
    .values({
      profileId,
      email,
      status: "paid",
      total: product.salePrice ?? product.price,
      currency: product.currency,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values({
    orderId: order.id,
    productId: product.id,
    title: product.title,
    quantity: 1,
    unitPrice: product.salePrice ?? product.price,
  });

  await db
    .update(products)
    .set({ inventorySold: sql`${products.inventorySold} + 1` })
    .where(eq(products.id, product.id));

  const files = await db
    .select({ id: digitalFiles.id })
    .from(digitalFiles)
    .where(eq(digitalFiles.productId, product.id));

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  for (const file of files) {
    await db.insert(downloadTokens).values({
      orderId: order.id,
      fileId: file.id,
      token: randomBytes(24).toString("hex"),
      expiresAt,
      maxDownloads: 5,
    });
  }
}

