"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { digitalFiles, products, profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";

type Result = { success: boolean; error?: string; fileId?: string };

async function ownsProduct(productId: string, userId: string) {
  const [row] = await db
    .select({ userId: profiles.userId })
    .from(products)
    .innerJoin(profiles, eq(products.profileId, profiles.id))
    .where(eq(products.id, productId))
    .limit(1);
  return row?.userId === userId;
}

export async function attachDigitalFile(
  productId: string,
  data: {
    filename: string;
    storageKey: string;
    mimeType?: string;
    sizeBytes?: number;
  },
): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await canUseFeature(user.id, "digitalProducts"))) {
    return { success: false, error: "Upgrade to Pro to attach files." };
  }
  if (!(await ownsProduct(productId, user.id))) {
    return { success: false, error: "Access denied." };
  }

  const [file] = await db
    .insert(digitalFiles)
    .values({
      productId,
      filename: data.filename,
      storageKey: data.storageKey,
      mimeType: data.mimeType ?? null,
      sizeBytes: data.sizeBytes ?? null,
    })
    .returning({ id: digitalFiles.id });

  revalidatePath("/dashboard/products");
  return { success: true, fileId: file.id };
}

export async function listProductFiles(productId: string) {
  const user = await getCurrentDbUser();
  if (!(await ownsProduct(productId, user.id))) return [];
  return db
    .select()
    .from(digitalFiles)
    .where(eq(digitalFiles.productId, productId));
}

export async function removeDigitalFile(fileId: string): Promise<Result> {
  const user = await getCurrentDbUser();
  const [file] = await db
    .select({ productId: digitalFiles.productId })
    .from(digitalFiles)
    .where(eq(digitalFiles.id, fileId))
    .limit(1);
  if (!file) return { success: false, error: "Not found" };
  if (!(await ownsProduct(file.productId, user.id))) {
    return { success: false, error: "Access denied." };
  }
  await db.delete(digitalFiles).where(eq(digitalFiles.id, fileId));
  revalidatePath("/dashboard/products");
  return { success: true };
}
