import { z } from "zod";
import { Code2 } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { CustomEmbedRender } from "./render";
import { CustomEmbedEditor } from "./editor";

export const customEmbedSchema = z.object({
  html: z.string(),
});

export type CustomEmbedConfig = z.infer<typeof customEmbedSchema>;

export const customEmbedDescriptor: BlockDescriptor<CustomEmbedConfig> = {
  type: "CUSTOM_EMBED",
  label: "Embed",
  description: "Embed content from YouTube, Vimeo, Spotify, Maps, and more",
  icon: Code2,
  category: "media",
  schema: customEmbedSchema,
  defaultConfig: { html: "" },
  Render: CustomEmbedRender,
  Editor: CustomEmbedEditor,
};
