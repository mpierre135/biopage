"use client";

import { useRef, useState } from "react";
import { BlockRenderProps } from "@/lib/blocks/types";
import { YoutubeConfig } from "./index";
import { Play } from "lucide-react";

function extractVideoId(input: string): string {
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0];
    return url.searchParams.get("v") ?? input;
  } catch {
    return input;
  }
}

export function YoutubeRender({ config }: BlockRenderProps<YoutubeConfig>) {
  const { url, videoId, title = "YouTube video" } = config;
  const rawId = videoId ?? url ?? "";
  const id = extractVideoId(rawId);
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!id) return null;

  const thumbnailUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

  if (active) {
    return (
      <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl aspect-video bg-black">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video bg-black group cursor-pointer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity"
        loading="lazy"
      />
      <button
        type="button"
        onClick={() => setActive(true)}
        aria-label={`Play ${title}`}
        className="absolute inset-0 flex items-center justify-center w-full h-full"
      >
        <span className="flex items-center justify-center size-16 rounded-full bg-red-600 text-white shadow-lg group-hover:scale-110 transition-transform">
          <Play className="size-6 fill-current ml-1" />
        </span>
      </button>
      {title && (
        <span className="absolute bottom-0 left-0 right-0 px-4 py-2 text-sm font-medium text-white bg-gradient-to-t from-black/80 to-transparent truncate">
          {title}
        </span>
      )}
    </div>
  );
}
