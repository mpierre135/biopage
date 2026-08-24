import { BlockRenderProps } from "@/lib/blocks/types";
import { DividerConfig } from "./index";

export function DividerRender({ config }: BlockRenderProps<DividerConfig>) {
  const { style = "line" } = config;

  if (style === "space") {
    return <div className="h-6" aria-hidden="true" />;
  }

  if (style === "dots") {
    return (
      <div className="flex items-center justify-center gap-2 py-2" aria-hidden="true">
        <span className="size-1.5 rounded-full bg-border" />
        <span className="size-1.5 rounded-full bg-border" />
        <span className="size-1.5 rounded-full bg-border" />
      </div>
    );
  }

  return <hr className="border-border" />;
}
