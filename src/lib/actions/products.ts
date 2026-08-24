"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { products, profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";

type ActionResult = { success: boolean; error?: string; productId?: string };

async function ownedProfile(profileId: string, userId: string) {
  const [profile] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);
  return profile?.userId === userId;
}

export async function createProduct(
  profileId: string,
  data: {
    title: string;
    description?: string;
    price: string;
    currency?: string;
    thumbnail?: string;
    externalUrl?: string;
  },
): Promise<ActionResult> {
  const user = await getCurrentDbUser();
  if (!(await ownedProfile(profileId, user.id))) {
    return { success: false, error: "Access denied." };
  }
  if (!(await canUseFeature(user.id, "digitalProducts"))) {
    return { success: false, error: "Upgrade to Pro to sell products." };
  }
  if (!data.title.trim()) {
    return { success: false, error: "Title is required." };
  }
  const price = Number(data.price);
  if (Number.isNaN(price) || price < 0) {
    return { success: false, error: "Invalid price." };
  }

  const [row] = await db
    .insert(products)
    .values({
      profileId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      price: price.toFixed(2),
      currency: data.currency ?? "usd",
      thumbnail: data.thumbnail?.trim() || null,
      externalUrl: data.externalUrl?.trim() || null,
      status: "active",
    })
    .returning({ id: products.id });

  revalidatePath("/dashboard/products");
  return { success: true, productId: row.id };
}

export async function updateProductStatus(
  productId: string,
  status: "active" | "draft" | "archived",
): Promise<ActionResult> {
  const user = await getCurrentDbUser();
  const [product] = await db
    .select({ profileId: products.profileId })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) return { success: false, error: "Product not found." };
  if (!(await ownedProfile(product.profileId, user.id))) {
    return { success: false, error: "Access denied." };
  }

  await db.update(products).set({ status }).where(eq(products.id, productId));
  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const user = await getCurrentDbUser();
  const [product] = await db
    .select({ profileId: products.profileId })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) return { success: false, error: "Product not found." };
  if (!(await ownedProfile(product.profileId, user.id))) {
    return { success: false, error: "Access denied." };
  }

  await db.delete(products).where(eq(products.id, productId));
  revalidatePath("/dashboard/products");
  return { success: true };
}
