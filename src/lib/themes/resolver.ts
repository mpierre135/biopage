import type { CSSProperties } from "react";
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
  if (background?.imageUrl) {
    vars["--bh-bg-image"] = `url(${JSON.stringify(background.imageUrl)})`;
  }
  if (background?.imageSize) vars["--bh-bg-size"] = background.imageSize;
  if (background?.imagePosition) {
    vars["--bh-bg-position"] = background.imagePosition;
  }
  if (background?.imageAttachment) {
    vars["--bh-bg-attachment"] = background.imageAttachment;
  }
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
): CSSProperties {
  return vars as CSSProperties;
}

/**
 * Builds the page shell background from ThemeConfig (color, gradient, or image).
 */
export function buildPageBackgroundStyle(
  config: ThemeConfig = {},
): CSSProperties {
  const bg = config.background ?? {};
  const style: CSSProperties = {
    color: config.colors?.text ?? "#1e293b",
    fontFamily: config.typography?.family ?? "inherit",
  };

  if (bg.imageUrl) {
    style.backgroundColor = bg.color ?? "#0f172a";
    style.backgroundImage = `url(${JSON.stringify(bg.imageUrl)})`;
    style.backgroundSize = bg.imageSize ?? "cover";
    style.backgroundPosition = bg.imagePosition ?? "center";
    style.backgroundRepeat = "no-repeat";
    style.backgroundAttachment = bg.imageAttachment ?? "scroll";
    return style;
  }

  if (bg.gradient) {
    style.background = bg.gradient;
    return style;
  }

  style.background = bg.color ?? "#ffffff";
  return style;
}

export function hasBackgroundOverlay(config: ThemeConfig = {}): boolean {
  const opacity = config.background?.overlayOpacity ?? 0;
  return Boolean(config.background?.imageUrl && opacity > 0);
}

export function backgroundOverlayStyle(
  config: ThemeConfig = {},
): CSSProperties | null {
  if (!hasBackgroundOverlay(config)) return null;
  const bg = config.background!;
  return {
    backgroundColor: bg.overlayColor ?? "#000000",
    opacity: bg.overlayOpacity ?? 0.35,
  };
}
