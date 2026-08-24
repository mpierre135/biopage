import { z } from "zod";
import { User } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { ContactRender } from "./render";
import { ContactEditor } from "./editor";

export const contactSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
});

export type ContactConfig = z.infer<typeof contactSchema>;

export const contactDescriptor: BlockDescriptor<ContactConfig> = {
  type: "CONTACT",
  label: "Contact Info",
  description: "Display your contact details",
  icon: User,
  category: "layout",
  schema: contactSchema,
  defaultConfig: {},
  Render: ContactRender,
  Editor: ContactEditor,
};
