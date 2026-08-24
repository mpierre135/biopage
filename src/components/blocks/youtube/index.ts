import { z } from "zod";
import { Video } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { YoutubeRender } from "./render";
import { YoutubeEditor } from "./editor";

export const youtubeSchema = z.object({
  videoId: z.string().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
});

export type YoutubeConfig = z.infer<typeof youtubeSchema>;

export const youtubeDescriptor: BlockDescriptor<YoutubeConfig> = {
  type: "YOUTUBE",
  label: "YouTube",
  description: "Embed a YouTube video with a click-to-play preview",
  icon: Video,
  category: "media",
  schema: youtubeSchema,
  defaultConfig: {},
  Render: YoutubeRender,
  Editor: YoutubeEditor,
};
