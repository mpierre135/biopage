import { z } from "zod";
import { AlignLeft } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { TextRender } from "./render";
import { TextEditor } from "./editor";

export const textSchema = z.object({
  content: z.string(),
});

export type TextConfig = z.infer<typeof textSchema>;

export const textDescriptor: BlockDescriptor<TextConfig> = {
  type: "TEXT",
  label: "Text",
  description: "A block of freeform text or a note",
  icon: AlignLeft,
  category: "layout",
  schema: textSchema,
  defaultConfig: { content: "" },
  Render: TextRender,
  Editor: TextEditor,
};
