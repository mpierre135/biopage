export type EditorSuggestion = {
  key: string;
  title: string;
  body: string;
  action: string;
};

export function getFollowerTotal(
  socials: { enabled?: boolean; followerCount?: number | null }[],
) {
  return socials.reduce(
    (total, social) => total + (social.enabled === false ? 0 : Math.max(0, social.followerCount ?? 0)),
    0,
  );
}

export function isFollowerDataStale(
  syncedAt: string | Date | null,
  now = new Date(),
) {
  if (!syncedAt) return true;
  return now.getTime() - new Date(syncedAt).getTime() >= 24 * 60 * 60 * 1000;
}

export function getEditorSuggestions(input: {
  hasBio: boolean;
  hasProfileImage: boolean;
  blockTypes: string[];
  collectionCount: number;
  hasShopify: boolean;
  dismissed: string[];
}): EditorSuggestion[] {
  const suggestions: EditorSuggestion[] = [];
  const visible = (key: string) => !input.dismissed.includes(key);
  if ((!input.hasBio || !input.hasProfileImage) && visible("complete-profile")) {
    suggestions.push({ key: "complete-profile", title: "Finish your profile", body: "A photo and bio help visitors recognize you.", action: "Review" });
  }
  if (input.blockTypes.includes("PRODUCT") && input.collectionCount === 0 && visible("product-collection")) {
    suggestions.push({ key: "product-collection", title: "Group products into a collection", body: "Make your storefront easier to browse.", action: "Add collection" });
  }
  if (input.hasShopify && !input.blockTypes.includes("PRODUCT") && visible("shopify-product")) {
    suggestions.push({ key: "shopify-product", title: "Feature a Shopify product", body: "Turn your connected catalog into a shoppable block.", action: "Add product" });
  }
  if (!input.blockTypes.some((type) => type === "EMAIL_CAPTURE" || type === "SMS_CAPTURE") && visible("capture-audience")) {
    suggestions.push({ key: "capture-audience", title: "Grow your audience", body: "Add an email or SMS signup block.", action: "Review" });
  }
  return suggestions;
}
