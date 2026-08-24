import { z } from "zod";
import { Heart } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { DonationRender } from "./render";
import { DonationEditor } from "./editor";

export const donationSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  amounts: z.array(z.number()).default([5, 10, 25]),
  customAmount: z.boolean().default(false),
  donateUrl: z.string().optional(),
});

export type DonationConfig = z.infer<typeof donationSchema>;

export const donationDescriptor: BlockDescriptor<DonationConfig> = {
  type: "DONATION",
  label: "Donation",
  description: "Accept tips or donations",
  icon: Heart,
  category: "commerce",
  schema: donationSchema,
  defaultConfig: {
    title: "Support my work",
    amounts: [5, 10, 25],
    customAmount: false,
  },
  Render: DonationRender,
  Editor: DonationEditor,
};
