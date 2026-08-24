import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getPlatformFlags,
  isOauthProvider,
} from "@/lib/integrations/catalog";
import {
  authorizationUrl,
  encodeOauthState,
  newOauthState,
  normalizeShopifyShop,
  oauthStateCookie,
} from "@/lib/integrations/oauth";

function dashboardError(req: NextRequest, message: string) {
  const url = new URL("/dashboard/integrations", req.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: raw } = await params;
  if (!isOauthProvider(raw)) {
    return dashboardError(req, "Unknown integration.");
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const flags = getPlatformFlags();
  if (!flags[raw]) {
    return dashboardError(
      req,
      `${raw} is not configured on this BioHub instance yet.`,
    );
  }

  let shop: string | undefined;
  if (raw === "shopify") {
    const normalized = normalizeShopifyShop(
      req.nextUrl.searchParams.get("shop") ?? "",
    );
    if (!normalized) {
      return dashboardError(req, "Enter a valid .myshopify.com store domain.");
    }
    shop = normalized;
  }

  const state = encodeOauthState(newOauthState(userId, raw, shop));
  const authorize = authorizationUrl(raw, state, shop);
  if (!authorize) {
    return dashboardError(req, "Could not start the connection.");
  }

  const res = NextResponse.redirect(authorize);
  const cookie = oauthStateCookie(state);
  res.cookies.set(cookie);
  return res;
}
