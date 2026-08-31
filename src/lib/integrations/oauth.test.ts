import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decodeOauthState,
  encodeOauthState,
  newOauthState,
  normalizeShopifyShop,
} from "./oauth";

describe("OAuth state", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("round-trips a signed state", () => {
    vi.stubEnv("CLERK_SECRET_KEY", "test-secret");
    const state = newOauthState("user_123", "meta");
    expect(decodeOauthState(encodeOauthState(state))).toEqual(state);
  });

  it("rejects a tampered state", () => {
    vi.stubEnv("CLERK_SECRET_KEY", "test-secret");
    const encoded = encodeOauthState(newOauthState("user_123", "spotify"));
    expect(decodeOauthState(`${encoded}x`)).toBeNull();
  });

  it("rejects an expired state", () => {
    vi.stubEnv("CLERK_SECRET_KEY", "test-secret");
    const encoded = encodeOauthState({
      clerkUserId: "user_123",
      provider: "shopify",
      nonce: "nonce",
      exp: Date.now() - 1,
    });
    expect(decodeOauthState(encoded)).toBeNull();
  });
});

describe("Shopify domain normalization", () => {
  it("normalizes a store slug", () => {
    expect(normalizeShopifyShop("My-Store")).toBe("my-store.myshopify.com");
  });

  it("rejects non-Shopify domains", () => {
    expect(normalizeShopifyShop("example.com")).toBeNull();
  });
});
