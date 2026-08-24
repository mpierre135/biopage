import { z } from "zod";
import { Link2 } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { LinkRender } from "./render";
import { LinkEditor } from "./editor";

export const linkSchema = z.object({
  title: z.string(),
  url: z.string(),
  thumbnail: z.string().optional(),
  style: z.enum(["standard", "featured", "thumbnail", "hero"]).optional(),
  animation: z.enum(["none", "pulse", "shake"]).optional(),
});

export type LinkConfig = z.infer<typeof linkSchema>;

export const linkDescriptor: BlockDescriptor<LinkConfig> = {
  type: "LINK",
  label: "Link",
  description: "A clickable link button — the core building block",
  icon: Link2,
  category: "links",
  schema: linkSchema,
  defaultConfig: { title: "", url: "", style: "standard", animation: "none" },
  Render: LinkRender,
  Editor: LinkEditor,
};
