"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { TestimonialConfig } from "./index";

export function TestimonialRender({
  config,
}: BlockRenderProps<TestimonialConfig>) {
  if (!config.quote) return null;

  return (
    <figure className="space-y-4 rounded-xl border border-border bg-card p-5">
      <blockquote className="text-base leading-relaxed text-card-foreground">
        <span className="text-2xl leading-none text-muted-foreground">“</span>
        {config.quote}
        <span className="text-2xl leading-none text-muted-foreground">”</span>
      </blockquote>
      {(config.author || config.avatarUrl) && (
        <figcaption className="flex items-center gap-3">
          {config.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.avatarUrl}
              alt={config.author ?? ""}
              className="size-10 rounded-full object-cover"
              loading="lazy"
            />
          )}
          <div className="min-w-0">
            {config.author && (
              <p className="truncate text-sm font-semibold text-foreground">
                {config.author}
              </p>
            )}
            {config.role && (
              <p className="truncate text-xs text-muted-foreground">
                {config.role}
              </p>
            )}
          </div>
        </figcaption>
      )}
    </figure>
  );
}
