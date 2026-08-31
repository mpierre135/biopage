import { describe, expect, it } from "vitest";
import { getEditorSuggestions, getFollowerTotal, isFollowerDataStale } from "./rules";

describe("editor rules", () => {
  it("aggregates only enabled, non-negative follower counts", () => {
    expect(getFollowerTotal([{ followerCount: 120 }, { followerCount: 30 }, { followerCount: 50, enabled: false }, { followerCount: null }])).toBe(150);
  });

  it("treats missing and 24-hour-old follower data as stale", () => {
    const now = new Date("2026-08-31T12:00:00Z");
    expect(isFollowerDataStale(null, now)).toBe(true);
    expect(isFollowerDataStale("2026-08-30T12:00:00Z", now)).toBe(true);
    expect(isFollowerDataStale("2026-08-31T11:00:00Z", now)).toBe(false);
  });

  it("generates state-based suggestions and honors dismissals", () => {
    const suggestions = getEditorSuggestions({ hasBio: true, hasProfileImage: true, blockTypes: ["PRODUCT"], collectionCount: 0, hasShopify: true, dismissed: ["capture-audience"] });
    expect(suggestions.map((item) => item.key)).toEqual(["product-collection"]);
  });
});
