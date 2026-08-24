import { z } from "zod";
import { Minus } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { DividerRender } from "./render";
import { DividerEditor } from "./editor";

export const dividerSchema = z.object({
  style: z.enum(["line", "space", "dots"]).optional(),
});

export type DividerConfig = z.infer<typeof dividerSchema>;

export const dividerDescriptor: BlockDescriptor<DividerConfig> = {
  type: "DIVIDER",
  label: "Divider",
  description: "A visual separator between sections",
  icon: Minus,
  category: "layout",
  schema: dividerSchema,
  defaultConfig: { style: "line" },
  Render: DividerRender,
  Editor: DividerEditor,
};
