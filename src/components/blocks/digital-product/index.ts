import { z } from "zod";
import { Download } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { DigitalProductRender } from "./render";
import { DigitalProductEditor } from "./editor";

export const digitalProductSchema = z.object({
  productId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  thumbnail: z.string().optional(),
  showPrice: z.boolean().optional(),
  buttonText: z.string().optional(),
  fileType: z.string().optional(),
});

export type DigitalProductConfig = z.infer<typeof digitalProductSchema>;

export const digitalProductDescriptor: BlockDescriptor<DigitalProductConfig> = {
  type: "DIGITAL_PRODUCT",
  label: "Digital Product",
  description: "Sell a downloadable file — PDF, video, audio, or any digital asset",
  icon: Download,
  category: "commerce",
  schema: digitalProductSchema,
  defaultConfig: {
    title: "",
    showPrice: true,
    buttonText: "Get Instant Access",
    currency: "usd",
  },
  Render: DigitalProductRender,
  Editor: DigitalProductEditor,
  requiredFeature: "digitalProducts",
};
