import type { ThemeConfig } from "./types";

const RADIUS_MAP = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

/**
 * Resolve a ThemeConfig into CSS custom properties for the public profile page.
 */
export function themeToCssVars(
  config: ThemeConfig = {},
): Record<string, string> {
  const vars: Record<string, string> = {};
  const { background, typography, buttons, colors, cards, layout } = config;

  if (background?.color) vars["--bh-bg"] = background.color;
  if (background?.gradient) vars["--bh-bg-gradient"] = background.gradient;
  if (background?.imageUrl) vars["--bh-bg-image"] = `url(${background.imageUrl})`;
  if (background?.overlayColor) vars["--bh-bg-overlay"] = background.overlayColor;
  if (background?.overlayOpacity != null) {
    vars["--bh-bg-overlay-opacity"] = String(background.overlayOpacity);
  }

  if (typography?.family) vars["--bh-font"] = typography.family;
  if (typography?.headingWeight) {
    vars["--bh-heading-weight"] = String(typography.headingWeight);
  }
  if (typography?.bodyWeight) {
    vars["--bh-body-weight"] = String(typography.bodyWeight);
  }
  if (typography?.baseSize) vars["--bh-font-size"] = typography.baseSize;

  if (buttons?.backgroundColor) vars["--bh-btn-bg"] = buttons.backgroundColor;
  if (buttons?.textColor) vars["--bh-btn-text"] = buttons.textColor;
  if (buttons?.borderColor) vars["--bh-btn-border"] = buttons.borderColor;
  if (buttons?.shadow) vars["--bh-btn-shadow"] = buttons.shadow;
  if (buttons?.radius) vars["--bh-btn-radius"] = RADIUS_MAP[buttons.radius];
  if (buttons?.hoverBackgroundColor) {
    vars["--bh-btn-hover-bg"] = buttons.hoverBackgroundColor;
  }
  if (buttons?.transitionDuration) {
    vars["--bh-btn-transition"] = buttons.transitionDuration;
  } else {
    vars["--bh-btn-transition"] = "200ms";
  }

  if (colors?.primary) vars["--bh-primary"] = colors.primary;
  if (colors?.secondary) vars["--bh-secondary"] = colors.secondary;
  if (colors?.accent) vars["--bh-accent"] = colors.accent;
  if (colors?.text) vars["--bh-text"] = colors.text;
  if (colors?.textMuted) vars["--bh-text-muted"] = colors.textMuted;

  if (cards?.backgroundColor) vars["--bh-card-bg"] = cards.backgroundColor;
  if (cards?.borderColor) vars["--bh-card-border"] = cards.borderColor;
  if (cards?.borderRadius) vars["--bh-card-radius"] = cards.borderRadius;
  if (cards?.shadow) vars["--bh-card-shadow"] = cards.shadow;
  if (cards?.padding) vars["--bh-card-padding"] = cards.padding;

  if (layout?.containerMaxWidth) {
    vars["--bh-max-width"] = layout.containerMaxWidth;
  } else {
    vars["--bh-max-width"] = "28rem";
  }
  if (layout?.blockGap) vars["--bh-block-gap"] = layout.blockGap;
  if (layout?.avatarSize) vars["--bh-avatar-size"] = layout.avatarSize;
  if (layout?.avatarRingColor) {
    vars["--bh-avatar-ring"] = layout.avatarRingColor;
  }

  return vars;
}

export function cssVarsToStyle(
  vars: Record<string, string>,
): React.CSSProperties {
  return vars as React.CSSProperties;
}
