"use client";

import { useState } from "react";
import { BlockRenderProps } from "@/lib/blocks/types";
import { DonationConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";

function buildDonateHref(base: string, amount?: number): string {
  if (amount == null) return base;
  try {
    const url = new URL(base);
    url.searchParams.set("amount", String(amount));
    return url.toString();
  } catch {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}amount=${amount}`;
  }
}

export function DonationRender({
  config,
  blockId,
}: BlockRenderProps<DonationConfig>) {
  const amounts = config.amounts ?? [];
  const [custom, setCustom] = useState("");

  if (!config.donateUrl) return null;

  return (
    <div
      className="space-y-4 rounded-xl border border-border bg-card p-4"
      data-block-id={blockId}
    >
      <div className="space-y-1 text-center">
        {config.title && (
          <h3 className="font-semibold text-card-foreground">{config.title}</h3>
        )}
        {config.description && (
          <p className="text-sm text-muted-foreground">{config.description}</p>
        )}
      </div>

      {amounts.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {amounts.map((amount) => (
            <a
              key={amount}
              href={buildDonateHref(config.donateUrl!, amount)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              ${amount}
            </a>
          ))}
        </div>
      )}

      {config.customAmount && (
        <div className="flex gap-2">
          <Input
            type="number"
            min={1}
            step="1"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Custom $"
            className="min-h-11"
          />
          <a
            href={
              custom
                ? buildDonateHref(config.donateUrl, Number(custom))
                : config.donateUrl
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Heart className="size-4" />
            Donate
          </a>
        </div>
      )}

      {!config.customAmount && amounts.length === 0 && (
        <a
          href={config.donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Heart className="size-4" />
          Donate
        </a>
      )}
    </div>
  );
}
