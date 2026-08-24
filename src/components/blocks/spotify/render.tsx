"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { SpotifyConfig } from "./index";

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    const path = u.pathname.replace(/^\/intl-[a-z]{2}\//, "/");
    return `https://open.spotify.com/embed${path}`;
  } catch {
    return null;
  }
}

export function SpotifyRender({ config }: BlockRenderProps<SpotifyConfig>) {
  if (!config.url) return null;
  const embed = toEmbedUrl(config.url);
  if (!embed) return null;

  return (
    <iframe
      src={embed}
      title={config.title ?? "Spotify"}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="h-[152px] w-full rounded-xl border-0"
    />
  );
}
