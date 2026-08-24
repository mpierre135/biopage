import { z } from "zod";
import { Image } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { ImageRender } from "./render";
import { ImageEditor } from "./editor";

export const imageSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  linkUrl: z.string().optional(),
});

export type ImageConfig = z.infer<typeof imageSchema>;

export const imageDescriptor: BlockDescriptor<ImageConfig> = {
  type: "IMAGE",
  label: "Image",
  description: "Display an image, optionally linked to a URL",
  icon: Image,
  category: "media",
  schema: imageSchema,
  defaultConfig: { url: "" },
  Render: ImageRender,
  Editor: ImageEditor,
};
