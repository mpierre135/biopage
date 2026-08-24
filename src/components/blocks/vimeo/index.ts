import { z } from "zod";
import { Video } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { VimeoRender } from "./render";
import { VimeoEditor } from "./editor";

export const vimeoSchema = z.object({
  url: z.string().optional(),
  videoId: z.string().optional(),
  title: z.string().optional(),
});

export type VimeoConfig = z.infer<typeof vimeoSchema>;

export const vimeoDescriptor: BlockDescriptor<VimeoConfig> = {
  type: "VIMEO",
  label: "Vimeo",
  description: "Embed a Vimeo video",
  icon: Video,
  category: "media",
  schema: vimeoSchema,
  defaultConfig: {},
  Render: VimeoRender,
  Editor: VimeoEditor,
};
