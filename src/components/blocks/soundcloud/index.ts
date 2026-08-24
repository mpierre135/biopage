import { z } from "zod";
import { Music } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { SoundCloudRender } from "./render";
import { SoundCloudEditor } from "./editor";

export const soundcloudSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
});

export type SoundCloudConfig = z.infer<typeof soundcloudSchema>;

export const soundcloudDescriptor: BlockDescriptor<SoundCloudConfig> = {
  type: "SOUNDCLOUD",
  label: "SoundCloud",
  description: "Embed a SoundCloud track",
  icon: Music,
  category: "media",
  schema: soundcloudSchema,
  defaultConfig: {},
  Render: SoundCloudRender,
  Editor: SoundCloudEditor,
};
