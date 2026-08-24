"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { AppleMusicConfig } from "./index";

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (
      !u.hostname.includes("music.apple.com") &&
      !u.hostname.includes("embed.music.apple.com")
    ) {
      return null;
    }
    if (u.hostname.includes("embed.music.apple.com")) {
      return u.toString();
    }
    u.hostname = "embed.music.apple.com";
    return u.toString();
  } catch {
    return null;
  }
}

export function AppleMusicRender({
  config,
}: BlockRenderProps<AppleMusicConfig>) {
  if (!config.url) return null;
  const embed = toEmbedUrl(config.url);
  if (!embed) return null;

  return (
    <iframe
      src={embed}
      title={config.title ?? "Apple Music"}
      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
      loading="lazy"
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
      className="h-[175px] w-full rounded-xl border-0"
    />
  );
}
