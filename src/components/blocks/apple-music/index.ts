import { z } from "zod";
import { Music } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { AppleMusicRender } from "./render";
import { AppleMusicEditor } from "./editor";

export const appleMusicSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
});

export type AppleMusicConfig = z.infer<typeof appleMusicSchema>;

export const appleMusicDescriptor: BlockDescriptor<AppleMusicConfig> = {
  type: "APPLE_MUSIC",
  label: "Apple Music",
  description: "Embed an Apple Music song or album",
  icon: Music,
  category: "media",
  schema: appleMusicSchema,
  defaultConfig: {},
  Render: AppleMusicRender,
  Editor: AppleMusicEditor,
};
