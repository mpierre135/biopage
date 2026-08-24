import { z } from "zod";
import { GraduationCap } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { CourseRender } from "./render";
import { CourseEditor } from "./editor";

export const courseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  ctaUrl: z.string().optional(),
  thumbnail: z.string().optional(),
});

export type CourseConfig = z.infer<typeof courseSchema>;

export const courseDescriptor: BlockDescriptor<CourseConfig> = {
  type: "COURSE",
  label: "Course",
  description: "Sell and showcase a course",
  icon: GraduationCap,
  category: "commerce",
  schema: courseSchema,
  defaultConfig: {
    title: "",
    currency: "usd",
  },
  Render: CourseRender,
  Editor: CourseEditor,
  requiredFeature: "digitalProducts",
};
