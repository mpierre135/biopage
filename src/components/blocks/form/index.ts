import { z } from "zod";
import { FileText } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { FormRender } from "./render";
import { FormEditor } from "./editor";

export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "email", "textarea", "select"]),
  label: z.string(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export const formSchema = z.object({
  headline: z.string().optional(),
  fields: z.array(formFieldSchema).default([]),
  submitLabel: z.string().default("Submit"),
  successMessage: z.string().default("Thanks! We got your response."),
});

export type FormConfig = z.infer<typeof formSchema>;
export type FormField = z.infer<typeof formFieldSchema>;

export const formDescriptor: BlockDescriptor<FormConfig> = {
  type: "FORM",
  label: "Form",
  description: "A custom multi-field form",
  icon: FileText,
  category: "capture",
  schema: formSchema,
  defaultConfig: {
    headline: "Get in touch",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        required: true,
      },
    ],
    submitLabel: "Submit",
    successMessage: "Thanks! We got your response.",
  },
  Render: FormRender,
  Editor: FormEditor,
};
