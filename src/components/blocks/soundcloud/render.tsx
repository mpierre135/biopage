"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { SoundCloudConfig } from "./index";

export function SoundCloudRender({
  config,
}: BlockRenderProps<SoundCloudConfig>) {
  if (!config.url) return null;

  const embed = `https://w.soundcloud.com/player/?url=${encodeURIComponent(config.url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;

  return (
    <iframe
      src={embed}
      title={config.title ?? "SoundCloud"}
      allow="autoplay"
      loading="lazy"
      className="h-[166px] w-full rounded-xl border-0"
    />
  );
}
