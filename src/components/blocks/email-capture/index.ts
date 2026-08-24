import { z } from "zod";
import { Mail } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { EmailCaptureRender } from "./render";
import { EmailCaptureEditor } from "./editor";

export const emailCaptureSchema = z.object({
  headline: z.string(),
  buttonText: z.string(),
  collectFirstName: z.boolean().optional(),
  successMessage: z.string(),
});

export type EmailCaptureConfig = z.infer<typeof emailCaptureSchema>;

export const emailCaptureDescriptor: BlockDescriptor<EmailCaptureConfig> = {
  type: "EMAIL_CAPTURE",
  label: "Email Capture",
  description: "Collect email addresses from your audience",
  icon: Mail,
  category: "capture",
  schema: emailCaptureSchema,
  defaultConfig: {
    headline: "Join my newsletter",
    buttonText: "Subscribe",
    collectFirstName: false,
    successMessage: "You're in! Thanks for signing up.",
  },
  Render: EmailCaptureRender,
  Editor: EmailCaptureEditor,
  requiredFeature: "leadCapture",
};
