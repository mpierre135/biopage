"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { CourseConfig } from "./index";
import { GraduationCap } from "lucide-react";

function formatPrice(price: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function CourseRender({ config, blockId }: BlockRenderProps<CourseConfig>) {
  if (!config.title) return null;

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card"
      data-block-id={blockId}
    >
      {config.thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.thumbnail}
          alt={config.title}
          className="h-48 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-card-foreground">
              {config.title}
            </h3>
            {config.description && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {config.description}
              </p>
            )}
          </div>
          {typeof config.price === "number" && (
            <span className="shrink-0 text-lg font-bold text-card-foreground">
              {formatPrice(config.price, config.currency)}
            </span>
          )}
        </div>
        {config.ctaUrl && (
          <a
            href={config.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <GraduationCap className="size-4" />
            Enroll now
          </a>
        )}
      </div>
    </div>
  );
}
