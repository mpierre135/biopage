import { z } from "zod";
import { MessageSquare } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { SmsCaptureRender } from "./render";
import { SmsCaptureEditor } from "./editor";

export const smsCaptureSchema = z.object({
  headline: z.string(),
  buttonText: z.string(),
  successMessage: z.string(),
});

export type SmsCaptureConfig = z.infer<typeof smsCaptureSchema>;

export const smsCaptureDescriptor: BlockDescriptor<SmsCaptureConfig> = {
  type: "SMS_CAPTURE",
  label: "SMS Capture",
  description: "Collect phone numbers via text opt-in",
  icon: MessageSquare,
  category: "capture",
  schema: smsCaptureSchema,
  defaultConfig: {
    headline: "Get text updates from me",
    buttonText: "Text Me",
    successMessage: "Thanks! You'll hear from us soon.",
  },
  Render: SmsCaptureRender,
  Editor: SmsCaptureEditor,
};
