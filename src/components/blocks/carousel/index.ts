import { z } from "zod";
import { ChevronRight } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { CarouselRender } from "./render";
import { CarouselEditor } from "./editor";

export const carouselSchema = z.object({
  images: z
    .array(z.object({ url: z.string(), alt: z.string().optional() }))
    .default([]),
});

export type CarouselConfig = z.infer<typeof carouselSchema>;

export const carouselDescriptor: BlockDescriptor<CarouselConfig> = {
  type: "CAROUSEL",
  label: "Carousel",
  description: "A swipeable image carousel",
  icon: ChevronRight,
  category: "media",
  schema: carouselSchema,
  defaultConfig: {
    images: [],
  },
  Render: CarouselRender,
  Editor: CarouselEditor,
};
