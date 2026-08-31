import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import {
  appBaseUrl,
  type OauthProvider,
} from "@/lib/integrations/catalog";

const STATE_COOKIE = "biohub_oauth_state";
const STATE_TTL_MS = 10 * 60 * 1000;

export type OauthState = {
  clerkUserId: string;
  provider: OauthProvider;
  shop?: string;
  nonce: string;
  exp: number;
};

function signingKey(): string {
  const key = (
    process.env.CLERK_SECRET_KEY ??
    process.env.INTEGRATION_STATE_SECRET ??
    "biohub-dev-oauth-state"
  );
  if (process.env.NODE_ENV === "production" && key === "biohub-dev-oauth-state") {
    throw new Error(
      "OAuth state signing is not configured. Set CLERK_SECRET_KEY or INTEGRATION_STATE_SECRET.",
    );
  }
  return key;
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function encodeOauthState(state: OauthState): string {
  const payload = Buffer.from(JSON.stringify(state), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function decodeOauthState(raw: string | undefined): OauthState | null {
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as OauthState;
    if (
      !parsed.clerkUserId ||
      !["shopify", "spotify", "meta"].includes(parsed.provider) ||
      !parsed.nonce ||
      !parsed.exp
    ) {
      return null;
    }
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function oauthStateCookie(value: string) {
  return {
    name: STATE_COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(STATE_TTL_MS / 1000),
  };
}

export function oauthStateCookieName() {
  return STATE_COOKIE;
}

export function newOauthState(
  clerkUserId: string,
  provider: OauthProvider,
  shop?: string,
): OauthState {
  return {
    clerkUserId,
    provider,
    shop,
    nonce: randomBytes(16).toString("hex"),
    exp: Date.now() + STATE_TTL_MS,
  };
}

export function callbackUrl(provider: OauthProvider): string {
  return `${appBaseUrl()}/api/integrations/${provider}/callback`;
}

export function normalizeShopifyShop(input: string): string | null {
  const trimmed = input.trim().toLowerCase().replace(/^https?:\/\//, "");
  const host = trimmed.split("/")[0]?.replace(/\/$/, "") ?? "";
  if (!host) return null;
  const shop = host.includes(".") ? host : `${host}.myshopify.com`;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) return null;
  return shop;
}

export function authorizationUrl(
  provider: OauthProvider,
  state: string,
  shop?: string,
): string | null {
  const redirectUri = callbackUrl(provider);
  switch (provider) {
    case "shopify": {
      const clientId = process.env.SHOPIFY_CLIENT_ID;
      if (!clientId || !shop) return null;
      const params = new URLSearchParams({
        client_id: clientId,
        scope: "read_products",
        redirect_uri: redirectUri,
        state,
      });
      return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
    }
    case "spotify": {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      if (!clientId) return null;
      const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: "user-read-email user-read-private",
        state,
      });
      return `https://accounts.spotify.com/authorize?${params.toString()}`;
    }
    case "meta": {
      const appId = process.env.META_APP_ID;
      if (!appId) return null;
      const params = new URLSearchParams({
        client_id: appId,
        redirect_uri: redirectUri,
        state,
        response_type: "code",
        scope: "email,public_profile,ads_read",
      });
      return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
    }
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

export type TokenResult = {
  credentials: Record<string, unknown>;
  config: Record<string, unknown>;
};

export async function exchangeOauthCode(
  provider: OauthProvider,
  code: string,
  shop?: string,
): Promise<TokenResult> {
  switch (provider) {
    case "shopify":
      return exchangeShopify(code, shop);
    case "spotify":
      return exchangeSpotify(code);
    case "meta":
      return exchangeMeta(code);
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

async function exchangeShopify(
  code: string,
  shop?: string,
): Promise<TokenResult> {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret || !shop) {
    throw new Error("Shopify is not configured.");
  }

  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error("Shopify token exchange failed.");
  }
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    scope?: string;
  };
  if (!tokenJson.access_token) {
    throw new Error("Shopify did not return an access token.");
  }

  let shopName = shop;
  try {
    const shopRes = await fetch(
      `https://${shop}/admin/api/2024-10/shop.json`,
      { headers: { "X-Shopify-Access-Token": tokenJson.access_token } },
    );
    if (shopRes.ok) {
      const body = (await shopRes.json()) as {
        shop?: { name?: string; domain?: string; myshopify_domain?: string };
      };
      shopName = body.shop?.name ?? shop;
    }
  } catch {
    // Shop metadata is optional.
  }

  return {
    credentials: {
      accessToken: tokenJson.access_token,
      scope: tokenJson.scope ?? "read_products",
    },
    config: {
      shop,
      shopName,
      storeUrl: `https://${shop}`,
    },
  };
}

async function exchangeSpotify(code: string): Promise<TokenResult> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Spotify is not configured.");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl("spotify"),
    }),
  });
  if (!tokenRes.ok) {
    throw new Error("Spotify token exchange failed.");
  }
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
  };
  if (!tokenJson.access_token) {
    throw new Error("Spotify did not return an access token.");
  }

  let displayName = "Spotify";
  let profileUrl: string | undefined;
  try {
    const meRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (meRes.ok) {
      const me = (await meRes.json()) as {
        display_name?: string;
        id?: string;
        external_urls?: { spotify?: string };
      };
      displayName = me.display_name ?? me.id ?? displayName;
      profileUrl = me.external_urls?.spotify;
    }
  } catch {
    // Profile metadata is optional.
  }

  return {
    credentials: {
      accessToken: tokenJson.access_token,
      refreshToken: tokenJson.refresh_token,
      expiresAt: Date.now() + (tokenJson.expires_in ?? 3600) * 1000,
    },
    config: {
      displayName,
      profileUrl,
    },
  };
}

async function exchangeMeta(code: string): Promise<TokenResult> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("Meta is not configured.");
  }

  const tokenParams = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: callbackUrl("meta"),
    code,
  });
  const tokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${tokenParams.toString()}`,
  );
  if (!tokenRes.ok) {
    throw new Error("Meta token exchange failed.");
  }
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
  };
  if (!tokenJson.access_token) {
    throw new Error("Meta did not return an access token.");
  }

  const graphVersion = process.env.META_API_VERSION ?? "v21.0";
  const appsecretProof = createHmac("sha256", appSecret)
    .update(tokenJson.access_token)
    .digest("hex");
  let name = "Meta";
  let userId: string | undefined;
  try {
    const meRes = await fetch(
      `https://graph.facebook.com/${graphVersion}/me?fields=id,name&access_token=${encodeURIComponent(tokenJson.access_token)}&appsecret_proof=${appsecretProof}`,
    );
    if (meRes.ok) {
      const me = (await meRes.json()) as { id?: string; name?: string };
      name = me.name ?? name;
      userId = me.id;
    }
  } catch {
    // Profile metadata is optional.
  }

  return {
    credentials: {
      accessToken: tokenJson.access_token,
      expiresAt: tokenJson.expires_in
        ? Date.now() + tokenJson.expires_in * 1000
        : undefined,
    },
    config: {
      name,
      userId,
    },
  };
}
