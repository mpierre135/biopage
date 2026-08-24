import { z } from "zod";
import { HelpCircle } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { FaqRender } from "./render";
import { FaqEditor } from "./editor";

export const faqSchema = z.object({
  items: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .default([]),
});

export type FaqConfig = z.infer<typeof faqSchema>;

export const faqDescriptor: BlockDescriptor<FaqConfig> = {
  type: "FAQ",
  label: "FAQ",
  description: "Frequently asked questions",
  icon: HelpCircle,
  category: "layout",
  schema: faqSchema,
  defaultConfig: {
    items: [{ question: "What do you offer?", answer: "Tell visitors about your work." }],
  },
  Render: FaqRender,
  Editor: FaqEditor,
};
