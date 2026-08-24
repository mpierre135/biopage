import { z } from "zod";
import { Share2 } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { SocialRender } from "./render";
import { SocialEditor } from "./editor";

export const socialSchema = z.object({
  links: z
    .array(
      z.object({
        provider: z.string(),
        url: z.string(),
        label: z.string().optional(),
      }),
    )
    .default([]),
});

export type SocialConfig = z.infer<typeof socialSchema>;

export const socialDescriptor: BlockDescriptor<SocialConfig> = {
  type: "SOCIAL",
  label: "Social Icons",
  description: "Show your social media links as icons",
  icon: Share2,
  category: "layout",
  schema: socialSchema,
  defaultConfig: { links: [] },
  Render: SocialRender,
  Editor: SocialEditor,
};
