import { z } from "zod";
import { Timer } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { CountdownRender } from "./render";
import { CountdownEditor } from "./editor";

export const countdownSchema = z.object({
  title: z.string().optional(),
  targetDate: z.string().optional(),
});

export type CountdownConfig = z.infer<typeof countdownSchema>;

export const countdownDescriptor: BlockDescriptor<CountdownConfig> = {
  type: "COUNTDOWN",
  label: "Countdown",
  description: "A countdown timer to an event",
  icon: Timer,
  category: "layout",
  schema: countdownSchema,
  defaultConfig: {
    title: "Coming soon",
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  },
  Render: CountdownRender,
  Editor: CountdownEditor,
};
