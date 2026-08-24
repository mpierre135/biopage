import { BlockRenderProps } from "@/lib/blocks/types";
import { TextConfig } from "./index";

export function TextRender({ config }: BlockRenderProps<TextConfig>) {
  const { content } = config;

  if (!content) return null;

  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap text-center text-muted-foreground">
      {content}
    </p>
  );
}
