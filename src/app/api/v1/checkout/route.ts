import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, profiles } from "@/lib/db/schema";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require("stripe") as typeof import("stripe").default;
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = body.productId as string | undefined;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product || product.status !== "active") {
      return NextResponse.json(
        { error: "Product not found or not available" },
        { status: 404 },
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payments are not configured. Please contact the site owner." },
        { status: 503 },
      );
    }

    const [profile] = await db
      .select({ username: profiles.username })
      .from(profiles)
      .where(eq(profiles.id, product.profileId))
      .limit(1);

    const successUrl = profile
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${profile.username}?checkout=success`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}?checkout=success`;

    const cancelUrl = profile
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${profile.username}`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}`;

    const lineItem = product.stripePriceId
      ? { price: product.stripePriceId, quantity: 1 }
      : {
          price_data: {
            currency: product.currency,
            product_data: { name: product.title },
            unit_amount: Math.round(
              parseFloat(product.salePrice ?? product.price) * 100,
            ),
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        productId: product.id,
        profileId: product.profileId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
