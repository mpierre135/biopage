import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";
import { z } from "zod";

export type BlockType =
  | "LINK"
  | "HEADER"
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "YOUTUBE"
  | "VIMEO"
  | "SPOTIFY"
  | "APPLE_MUSIC"
  | "SOUNDCLOUD"
  | "SOCIAL"
  | "EMAIL_CAPTURE"
  | "SMS_CAPTURE"
  | "FORM"
  | "CONTACT"
  | "PRODUCT"
  | "DIGITAL_PRODUCT"
  | "COURSE"
  | "BOOKING"
  | "DONATION"
  | "GALLERY"
  | "CAROUSEL"
  | "MAP"
  | "COUNTDOWN"
  | "FAQ"
  | "TESTIMONIAL"
  | "DIVIDER"
  | "CUSTOM_EMBED";

export interface BlockEditorProps<C> {
  config: C;
  onChange: (config: C) => void;
}

export interface BlockRenderProps<C> {
  config: C;
  blockId: string;
  profileUsername: string;
}

export interface BlockDescriptor<C = Record<string, unknown>> {
  type: BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  category: "links" | "media" | "capture" | "commerce" | "layout";
  schema: z.ZodType<C>;
  defaultConfig: C;
  Editor: ComponentType<BlockEditorProps<C>>;
  Render: ComponentType<BlockRenderProps<C>>;
  requiredFeature?: string;
  /** When false, block is hidden from the add picker (not yet implemented). */
  ready?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBlockDescriptor = BlockDescriptor<any>;
