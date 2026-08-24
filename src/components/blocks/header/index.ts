import { z } from "zod";
import { Heading2 } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { HeaderRender } from "./render";
import { HeaderEditor } from "./editor";

export const headerSchema = z.object({
  text: z.string(),
  size: z.enum(["sm", "md", "lg"]).optional(),
});

export type HeaderConfig = z.infer<typeof headerSchema>;

export const headerDescriptor: BlockDescriptor<HeaderConfig> = {
  type: "HEADER",
  label: "Heading",
  description: "A bold section heading to organize your page",
  icon: Heading2,
  category: "layout",
  schema: headerSchema,
  defaultConfig: { text: "", size: "md" },
  Render: HeaderRender,
  Editor: HeaderEditor,
};
