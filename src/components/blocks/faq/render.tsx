"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { FaqConfig } from "./index";

export function FaqRender({ config }: BlockRenderProps<FaqConfig>) {
  const items = (config.items ?? []).filter((i) => i.question);
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <details
          key={i}
          className="group rounded-xl border border-border bg-card px-4 py-3"
        >
          <summary className="cursor-pointer list-none font-medium text-sm text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            {item.question}
          </summary>
          <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
