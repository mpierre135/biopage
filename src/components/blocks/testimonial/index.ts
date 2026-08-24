import { z } from "zod";
import { Star } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { TestimonialRender } from "./render";
import { TestimonialEditor } from "./editor";

export const testimonialSchema = z.object({
  quote: z.string().optional(),
  author: z.string().optional(),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type TestimonialConfig = z.infer<typeof testimonialSchema>;

export const testimonialDescriptor: BlockDescriptor<TestimonialConfig> = {
  type: "TESTIMONIAL",
  label: "Testimonial",
  description: "A quote or social proof block",
  icon: Star,
  category: "layout",
  schema: testimonialSchema,
  defaultConfig: {
    quote: "",
    author: "",
  },
  Render: TestimonialRender,
  Editor: TestimonialEditor,
};
