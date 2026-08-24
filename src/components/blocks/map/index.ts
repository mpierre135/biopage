import { z } from "zod";
import { MapPin } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { MapRender } from "./render";
import { MapEditor } from "./editor";

export const mapSchema = z.object({
  query: z.string().optional(),
  title: z.string().optional(),
});

export type MapConfig = z.infer<typeof mapSchema>;

export const mapDescriptor: BlockDescriptor<MapConfig> = {
  type: "MAP",
  label: "Map",
  description: "Embed a location map",
  icon: MapPin,
  category: "media",
  schema: mapSchema,
  defaultConfig: { query: "", title: "Find us" },
  Render: MapRender,
  Editor: MapEditor,
};
