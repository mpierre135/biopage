"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { VimeoConfig } from "./index";

function extractVimeoId(input: string): string {
  if (/^\d+$/.test(input)) return input;
  try {
    const url = new URL(input);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.find((p) => /^\d+$/.test(p)) ?? input;
  } catch {
    return input;
  }
}

export function VimeoRender({ config }: BlockRenderProps<VimeoConfig>) {
  const raw = config.videoId ?? config.url ?? "";
  const id = extractVimeoId(raw);
  if (!id) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video bg-black">
      <iframe
        src={`https://player.vimeo.com/video/${id}`}
        title={config.title ?? "Vimeo video"}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
      />
    </div>
  );
}
