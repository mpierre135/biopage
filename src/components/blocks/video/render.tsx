"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { VideoConfig } from "./index";

export function VideoRender({ config }: BlockRenderProps<VideoConfig>) {
  if (!config.url) return null;

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      {config.title && (
        <p className="truncate px-3 py-2 text-sm font-medium text-white/90">
          {config.title}
        </p>
      )}
      <video
        src={config.url}
        poster={config.poster}
        controls
        playsInline
        className="aspect-video w-full"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
