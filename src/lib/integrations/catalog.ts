export const OAUTH_PROVIDERS = ["shopify", "spotify", "meta"] as const;
export const API_KEY_PROVIDERS = ["mailchimp", "klaviyo"] as const;

export type OauthProvider = (typeof OAUTH_PROVIDERS)[number];
export type ApiKeyProvider = (typeof API_KEY_PROVIDERS)[number];
export type ConnectProvider = OauthProvider | ApiKeyProvider;

export function isOauthProvider(v: string): v is OauthProvider {
  return (OAUTH_PROVIDERS as readonly string[]).includes(v);
}

export function isApiKeyProvider(v: string): v is ApiKeyProvider {
  return (API_KEY_PROVIDERS as readonly string[]).includes(v);
}

export function isConnectProvider(v: string): v is ConnectProvider {
  return isOauthProvider(v) || isApiKeyProvider(v);
}

export type PlatformFlags = {
  shopify: boolean;
  spotify: boolean;
  meta: boolean;
};

export function getPlatformFlags(): PlatformFlags {
  return {
    shopify: Boolean(
      process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET,
    ),
    spotify: Boolean(
      process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET,
    ),
    meta: Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET),
  };
}

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}
