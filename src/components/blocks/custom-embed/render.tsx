import { BlockRenderProps } from "@/lib/blocks/types";
import { CustomEmbedConfig } from "./index";
import { sanitizeEmbed } from "./sanitize";

export function CustomEmbedRender({ config }: BlockRenderProps<CustomEmbedConfig>) {
  const { html } = config;

  const safeHtml = sanitizeEmbed(html ?? "");

  if (!safeHtml) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 py-8 text-sm text-muted-foreground">
        Invalid or unsupported embed
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-xl [&>iframe]:w-full [&>iframe]:aspect-video [&>iframe]:border-0"
      // Safe — sanitizeEmbed only allows whitelisted iframe origins
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
