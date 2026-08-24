import { z } from "zod";
import { ShoppingBag } from "lucide-react";
import { BlockDescriptor } from "@/lib/blocks/types";
import { ProductRender } from "./render";
import { ProductEditor } from "./editor";

export const productSchema = z.object({
  productId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  thumbnail: z.string().optional(),
  showPrice: z.boolean().optional(),
  buttonText: z.string().optional(),
});

export type ProductConfig = z.infer<typeof productSchema>;

export const productDescriptor: BlockDescriptor<ProductConfig> = {
  type: "PRODUCT",
  label: "Product",
  description: "Showcase and sell a physical or digital product",
  icon: ShoppingBag,
  category: "commerce",
  schema: productSchema,
  defaultConfig: {
    title: "",
    showPrice: true,
    buttonText: "Buy Now",
    currency: "usd",
  },
  Render: ProductRender,
  Editor: ProductEditor,
  requiredFeature: "digitalProducts",
};
