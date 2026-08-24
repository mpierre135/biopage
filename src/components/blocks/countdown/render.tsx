"use client";

import { useEffect, useState } from "react";
import { BlockRenderProps } from "@/lib/blocks/types";
import { CountdownConfig } from "./index";

function partsUntil(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, done: diff === 0 };
}

export function CountdownRender({ config }: BlockRenderProps<CountdownConfig>) {
  const target = config.targetDate ? new Date(config.targetDate) : null;
  const [parts, setParts] = useState(() =>
    target && !Number.isNaN(target.getTime())
      ? partsUntil(target)
      : null,
  );

  useEffect(() => {
    if (!target || Number.isNaN(target.getTime())) return;
    const id = window.setInterval(() => setParts(partsUntil(target)), 1000);
    return () => window.clearInterval(id);
  }, [config.targetDate]);

  if (!parts) return null;

  const cells = [
    ["Days", parts.days],
    ["Hours", parts.hours],
    ["Min", parts.minutes],
    ["Sec", parts.seconds],
  ] as const;

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      {config.title && (
        <p className="mb-3 text-sm font-medium text-foreground">{config.title}</p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {cells.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-muted/60 px-2 py-3">
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {String(value).padStart(2, "0")}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>
      {parts.done && (
        <p className="mt-3 text-xs text-muted-foreground">It&apos;s time.</p>
      )}
    </div>
  );
}
