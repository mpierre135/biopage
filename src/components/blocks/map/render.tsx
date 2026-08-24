"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { MapConfig } from "./index";

export function MapRender({ config }: BlockRenderProps<MapConfig>) {
  if (!config.query) return null;
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(config.query)}&z=14&output=embed`;

  return (
    <div className="space-y-2">
      {config.title && (
        <p className="text-sm font-medium text-foreground">{config.title}</p>
      )}
      <div className="overflow-hidden rounded-xl border border-border aspect-video">
        <iframe
          src={src}
          title={config.title ?? "Map"}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
