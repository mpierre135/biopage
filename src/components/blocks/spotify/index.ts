import { z } from "zod";
import { Music } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { SpotifyRender } from "./render";
import { SpotifyEditor } from "./editor";

export const spotifySchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
});

export type SpotifyConfig = z.infer<typeof spotifySchema>;

export const spotifyDescriptor: BlockDescriptor<SpotifyConfig> = {
  type: "SPOTIFY",
  label: "Spotify",
  description: "Embed a Spotify track, album, or playlist",
  icon: Music,
  category: "media",
  schema: spotifySchema,
  defaultConfig: {},
  Render: SpotifyRender,
  Editor: SpotifyEditor,
};
