import type { ThemeConfig } from "./types";

/**
 * Converts a `ThemeConfig` object into a flat map of CSS custom properties.
 *
 * Only defined (non-undefined) values are emitted, so callers can safely
 * spread partial configs without overwriting existing browser defaults with
 * empty strings.
 *
 * Usage:
 *   const vars = themeToCssVars(config);
 *   // Apply to a DOM element:
 *   Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
 */
export function themeToCssVars(config: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {};

  function set(key: string, value: string | number | boolean | undefined | null): void {
    if (value === undefined || value === null) return;
    vars[key] = String(value);
  }

  // Background
  const bg = config.background;
  if (bg) {
    set("--bg-color", bg.color);
    set("--bg-gradient", bg.gradient);
    set("--bg-image-url", bg.imageUrl ? `url(${bg.imageUrl})` : undefined);
    set("--bg-image-size", bg.imageSize);
    set("--bg-image-position", bg.imagePosition);
    set("--bg-image-attachment", bg.imageAttachment);
    set("--bg-overlay-color", bg.overlayColor);
    set("--bg-overlay-opacity", bg.overlayOpacity);
  }

  // Typography
  const typo = config.typography;
  if (typo) {
    set("--font-family", typo.family);
    set("--font-heading-weight", typo.headingWeight);
    set("--font-body-weight", typo.bodyWeight);
    set("--font-base-size", typo.baseSize);
  }

  // Buttons
  const btn = config.buttons;
  if (btn) {
    set("--btn-style", btn.style);
    set("--btn-radius", radiusToCss(btn.radius));
    set("--btn-bg", btn.backgroundColor);
    set("--btn-text", btn.textColor);
    set("--btn-border", btn.borderColor);
    set("--btn-shadow", btn.shadow);
    set("--btn-hover-bg", btn.hoverBackgroundColor);
    set("--btn-hover-text", btn.hoverTextColor);
    set("--btn-transition", btn.transitionDuration);
  }

  // Colors
  const colors = config.colors;
  if (colors) {
    set("--color-primary", colors.primary);
    set("--color-secondary", colors.secondary);
    set("--color-accent", colors.accent);
    set("--color-text", colors.text);
    set("--color-text-muted", colors.textMuted);
    set("--color-branding-bg", colors.brandingBg);
    set("--color-branding-text", colors.brandingText);
  }

  // Cards
  const card = config.cards;
  if (card) {
    set("--card-bg", card.backgroundColor);
    set("--card-border", card.borderColor);
    set("--card-radius", card.borderRadius);
    set("--card-shadow", card.shadow);
    set("--card-padding", card.padding);
  }

  // Layout
  const layout = config.layout;
  if (layout) {
    set("--layout-max-width", layout.containerMaxWidth);
    set("--layout-block-gap", layout.blockGap);
    set("--layout-block-padding", layout.blockPadding);
    set("--layout-avatar-size", layout.avatarSize);
    set("--layout-avatar-ring", layout.avatarRing ? "1" : layout.avatarRing === false ? "0" : undefined);
    set("--layout-avatar-ring-color", layout.avatarRingColor);
  }

  return vars;
}

/**
 * Maps ButtonRadius tokens to CSS border-radius values.
 */
function radiusToCss(radius: string | undefined): string | undefined {
  if (!radius) return undefined;
  const map: Record<string, string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  };
  return map[radius] ?? radius;
}
