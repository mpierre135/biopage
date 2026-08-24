"use client";

import { useState } from "react";
import { BlockRenderProps } from "@/lib/blocks/types";
import { CarouselConfig } from "./index";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CarouselRender({ config }: BlockRenderProps<CarouselConfig>) {
  const images = (config.images ?? []).filter((img) => img.url);
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const current = images[Math.min(index, images.length - 1)];

  function prev() {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt={current.alt ?? ""}
        className="aspect-video w-full object-cover"
        loading="lazy"
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="absolute top-1/2 left-2 flex min-h-11 min-w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute top-1/2 right-2 flex min-h-11 min-w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`size-2 cursor-pointer rounded-full ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
