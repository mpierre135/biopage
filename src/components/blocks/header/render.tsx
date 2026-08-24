import { BlockRenderProps } from "@/lib/blocks/types";
import { HeaderConfig } from "./index";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "text-lg font-semibold",
  md: "text-2xl font-bold",
  lg: "text-4xl font-extrabold",
} as const;

export function HeaderRender({ config }: BlockRenderProps<HeaderConfig>) {
  const { text, size = "md" } = config;

  if (!text) return null;

  return (
    <h2 className={cn("text-center leading-tight tracking-tight", sizeMap[size])}>
      {text}
    </h2>
  );
}
