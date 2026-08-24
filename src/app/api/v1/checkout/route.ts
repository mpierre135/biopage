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

export async function GET(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments are not configured. Please set STRIPE_SECRET_KEY." },
      { status: 503 },
    );
  }

  const productId = req.nextUrl.searchParams.get("productId");
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
      { error: "Product not found or not active" },
      { status: 404 },
    );
  }

  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.id, product.profileId))
    .limit(1);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const successUrl = profile
    ? `${baseUrl}/${profile.username}?purchase=success`
    : `${baseUrl}?purchase=success`;
  const cancelUrl = profile
    ? `${baseUrl}/${profile.username}`
    : baseUrl;

  const priceInCents = Math.round(Number(product.salePrice ?? product.price) * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.title,
              description: product.description ?? undefined,
              images: product.thumbnail ? [product.thumbnail] : undefined,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        productId: product.id,
        profileId: product.profileId,
      },
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
