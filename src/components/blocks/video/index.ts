import { z } from "zod";
import { Video } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { VideoRender } from "./render";
import { VideoEditor } from "./editor";

export const videoSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
  poster: z.string().optional(),
});

export type VideoConfig = z.infer<typeof videoSchema>;

export const videoDescriptor: BlockDescriptor<VideoConfig> = {
  type: "VIDEO",
  label: "Video",
  description: "Embed a hosted video file",
  icon: Video,
  category: "media",
  schema: videoSchema,
  defaultConfig: {},
  Render: VideoRender,
  Editor: VideoEditor,
};
