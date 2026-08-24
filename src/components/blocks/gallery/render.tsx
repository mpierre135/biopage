"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { GalleryConfig } from "./index";

export function GalleryRender({ config }: BlockRenderProps<GalleryConfig>) {
  const images = (config.images ?? []).filter((img) => img.url);
  if (images.length === 0) return null;

  const cols = config.columns === 3 ? 3 : 2;

  return (
    <div
      className={
        cols === 3
          ? "grid grid-cols-3 gap-2"
          : "grid grid-cols-2 gap-2"
      }
    >
      {images.map((image, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${image.url}-${i}`}
          src={image.url}
          alt={image.alt ?? ""}
          className="aspect-square w-full rounded-lg object-cover"
          loading="lazy"
        />
      ))}
    </div>
  );
}
