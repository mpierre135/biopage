"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { BookingConfig } from "./index";
import { CalendarDays, Clock } from "lucide-react";

export function BookingRender({
  config,
  blockId,
}: BlockRenderProps<BookingConfig>) {
  if (!config.title && !config.bookingUrl) return null;

  return (
    <div
      className="space-y-3 rounded-xl border border-border bg-card p-4"
      data-block-id={blockId}
    >
      <div className="space-y-1">
        {config.title && (
          <h3 className="font-semibold text-card-foreground">{config.title}</h3>
        )}
        {config.description && (
          <p className="text-sm text-muted-foreground">{config.description}</p>
        )}
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-muted-foreground">
          {typeof config.durationMinutes === "number" && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {config.durationMinutes} min
            </span>
          )}
          {typeof config.price === "number" && (
            <span>
              {config.price === 0
                ? "Free"
                : new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(config.price)}
            </span>
          )}
        </div>
      </div>
      {config.bookingUrl && (
        <a
          href={config.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <CalendarDays className="size-4" />
          Book now
        </a>
      )}
    </div>
  );
}
