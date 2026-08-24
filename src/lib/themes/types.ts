/**
 * ThemeConfig: the full design token surface for a BioHub profile page.
 *
 * All values are optional so partial configs can be deep-merged with a base
 * theme before being resolved to CSS custom properties.
 */

export type FontConfig = {
  /** CSS font-family value or a Google Fonts slug. */
  family?: string;
  /** Font weight for headings. */
  headingWeight?: number | string;
  /** Font weight for body text. */
  bodyWeight?: number | string;
  /** Base body size (e.g. "16px" or "1rem"). */
  baseSize?: string;
};

export type BackgroundConfig = {
  /** Solid color hex/hsl/rgb. */
  color?: string;
  /** Gradient CSS string (takes precedence over color). */
  gradient?: string;
  /** Background image URL. */
  imageUrl?: string;
  /** CSS background-size value (e.g. "cover", "contain"). */
  imageSize?: string;
  /** CSS background-position value. */
  imagePosition?: string;
  /** Background-attachment (e.g. "fixed" for parallax). */
  imageAttachment?: "scroll" | "fixed" | "local";
  /** Overlay color on top of the image for contrast. */
  overlayColor?: string;
  /** Overlay opacity (0–1). */
  overlayOpacity?: number;
};

export type ButtonStyle = "filled" | "outlined" | "ghost" | "soft" | "shadow";
export type ButtonRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";

export type ButtonConfig = {
  style?: ButtonStyle;
  radius?: ButtonRadius;
  /** Background color for filled/soft. */
  backgroundColor?: string;
  /** Text color. */
  textColor?: string;
  /** Border color for outlined. */
  borderColor?: string;
  /** Box-shadow CSS value. */
  shadow?: string;
  /** Hover background override. */
  hoverBackgroundColor?: string;
  /** Hover text color override. */
  hoverTextColor?: string;
  /** Transition duration (e.g. "150ms"). */
  transitionDuration?: string;
};

export type ColorPalette = {
  primary?: string;
  secondary?: string;
  accent?: string;
  /** Page background text color. */
  text?: string;
  /** Muted / secondary text. */
  textMuted?: string;
  /** Branding badge background. */
  brandingBg?: string;
  /** Branding badge text. */
  brandingText?: string;
};

export type CardConfig = {
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  shadow?: string;
  padding?: string;
};

export type LayoutConfig = {
  /** Max width of the profile container (e.g. "640px"). */
  containerMaxWidth?: string;
  /** Spacing between blocks (e.g. "12px"). */
  blockGap?: string;
  /** Internal block padding. */
  blockPadding?: string;
  /** Avatar size (e.g. "96px"). */
  avatarSize?: string;
  /** Show or hide the avatar ring. */
  avatarRing?: boolean;
  /** Avatar ring color. */
  avatarRingColor?: string;
};

export type ThemeConfig = {
  background?: BackgroundConfig;
  typography?: FontConfig;
  buttons?: ButtonConfig;
  colors?: ColorPalette;
  cards?: CardConfig;
  layout?: LayoutConfig;
};
