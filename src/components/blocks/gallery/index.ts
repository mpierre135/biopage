import { z } from "zod";
import { Images } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { GalleryRender } from "./render";
import { GalleryEditor } from "./editor";

export const gallerySchema = z.object({
  images: z
    .array(z.object({ url: z.string(), alt: z.string().optional() }))
    .default([]),
  columns: z.union([z.literal(2), z.literal(3)]).default(2),
});

export type GalleryConfig = z.infer<typeof gallerySchema>;

export const galleryDescriptor: BlockDescriptor<GalleryConfig> = {
  type: "GALLERY",
  label: "Gallery",
  description: "A photo gallery grid",
  icon: Images,
  category: "media",
  schema: gallerySchema,
  defaultConfig: {
    images: [],
    columns: 2,
  },
  Render: GalleryRender,
  Editor: GalleryEditor,
};
