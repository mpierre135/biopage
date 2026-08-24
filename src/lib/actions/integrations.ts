"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { integrations, products, profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";
import {
  isApiKeyProvider,
  isConnectProvider,
  type ApiKeyProvider,
} from "@/lib/integrations/catalog";
import { normalizeShopifyShop } from "@/lib/integrations/oauth";
import { sanitizeUrl } from "@/lib/security/urls";

type Result = { success: boolean; error?: string; imported?: number };

async function ownedProfile(userId: string) {
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return profile ?? null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export async function disconnectIntegration(
  provider: string,
): Promise<Result> {
  const user = await getCurrentDbUser();
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };
  if (!isConnectProvider(provider)) {
    return { success: false, error: "Unsupported provider." };
  }

  await db
    .delete(integrations)
    .where(
      and(
        eq(integrations.profileId, profile.id),
        eq(integrations.provider, provider),
      ),
    );

  revalidatePath("/dashboard/integrations");
  return { success: true };
}

export async function saveApiKeyIntegration(
  provider: ApiKeyProvider,
  apiKey: string,
  extra: { listId?: string } = {},
): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await canUseFeature(user.id, "integrations"))) {
    return {
      success: false,
      error: "Upgrade to Pro to connect email tools.",
    };
  }
  if (!isApiKeyProvider(provider)) {
    return { success: false, error: "Unsupported provider." };
  }

  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  const trimmed = apiKey.trim();
  if (!trimmed) return { success: false, error: "API key is required." };
  const listId = extra.listId?.trim();
  if (provider === "mailchimp" && !listId) {
    return { success: false, error: "Audience / list ID is required." };
  }

  await db
    .insert(integrations)
    .values({
      profileId: profile.id,
      provider,
      credentials: { apiKey: trimmed },
      config: listId ? { listId } : {},
      enabled: true,
    })
    .onConflictDoUpdate({
      target: [integrations.profileId, integrations.provider],
      set: {
        credentials: { apiKey: trimmed },
        config: listId ? { listId } : {},
        enabled: true,
      },
    });

  revalidatePath("/dashboard/integrations");
  return { success: true };
}

export async function saveShopifyStoreUrl(shopInput: string): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await canUseFeature(user.id, "integrations"))) {
    return {
      success: false,
      error: "Upgrade to Pro to connect a Shopify store.",
    };
  }
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  const shop = normalizeShopifyShop(shopInput);
  if (!shop) {
    return {
      success: false,
      error: "Enter a store like mystore.myshopify.com",
    };
  }

  const storeUrl = `https://${shop}`;
  const [existing] = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.profileId, profile.id),
        eq(integrations.provider, "shopify"),
      ),
    )
    .limit(1);

  const prevConfig = asRecord(existing?.config);
  const prevCreds = asRecord(existing?.credentials);

  await db
    .insert(integrations)
    .values({
      profileId: profile.id,
      provider: "shopify",
      credentials: prevCreds,
      config: { ...prevConfig, shop, storeUrl },
      enabled: true,
    })
    .onConflictDoUpdate({
      target: [integrations.profileId, integrations.provider],
      set: {
        config: { ...prevConfig, shop, storeUrl },
        enabled: true,
      },
    });

  revalidatePath("/dashboard/integrations");
  return { success: true };
}

type ShopifyProduct = {
  id?: number;
  title?: string;
  handle?: string;
  body_html?: string;
  image?: { src?: string };
  images?: { src?: string }[];
  variants?: { price?: string }[];
};

export async function importShopifyProducts(): Promise<Result> {
  const user = await getCurrentDbUser();
  if (!(await canUseFeature(user.id, "digitalProducts"))) {
    return { success: false, error: "Upgrade to Pro to import products." };
  }
  const profile = await ownedProfile(user.id);
  if (!profile) return { success: false, error: "Profile not found." };

  const [row] = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.profileId, profile.id),
        eq(integrations.provider, "shopify"),
      ),
    )
    .limit(1);

  if (!row) {
    return { success: false, error: "Connect Shopify first." };
  }

  const credentials = asRecord(row.credentials);
  const config = asRecord(row.config);
  const accessToken = String(credentials.accessToken ?? "");
  const shop = String(config.shop ?? "");
  if (!accessToken || !shop) {
    return {
      success: false,
      error:
        "Shopify OAuth is not connected yet. Connect the store, then import.",
    };
  }

  const res = await fetch(
    `https://${shop}/admin/api/2024-10/products.json?limit=50`,
    { headers: { "X-Shopify-Access-Token": accessToken } },
  );
  if (!res.ok) {
    return { success: false, error: "Could not read products from Shopify." };
  }

  const body = (await res.json()) as { products?: ShopifyProduct[] };
  const catalog = body.products ?? [];
  if (catalog.length === 0) {
    return { success: true, imported: 0 };
  }

  const existing = await db
    .select({
      id: products.id,
      externalUrl: products.externalUrl,
    })
    .from(products)
    .where(eq(products.profileId, profile.id));
  const known = new Set(
    existing.map((p) => p.externalUrl).filter((u): u is string => Boolean(u)),
  );

  let imported = 0;
  for (const item of catalog) {
    const handle = item.handle?.trim();
    const title = item.title?.trim();
    if (!handle || !title) continue;
    const externalUrl = sanitizeUrl(`https://${shop}/products/${handle}`);
    if (!externalUrl || known.has(externalUrl)) continue;

    const price = Number(item.variants?.[0]?.price ?? 0);
    const thumbnail = item.image?.src ?? item.images?.[0]?.src ?? null;
    const description = item.body_html
      ? item.body_html.replace(/<[^>]+>/g, " ").slice(0, 500).trim()
      : null;

    await db.insert(products).values({
      profileId: profile.id,
      title,
      description,
      price: (Number.isFinite(price) ? price : 0).toFixed(2),
      currency: "usd",
      thumbnail,
      externalUrl,
      status: "active",
    });
    known.add(externalUrl);
    imported += 1;
  }

  revalidatePath("/dashboard/integrations");
  revalidatePath("/dashboard/products");
  return { success: true, imported };
}
