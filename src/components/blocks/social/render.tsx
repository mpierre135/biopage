"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { SocialConfig } from "./index";
import { Globe, Share2 } from "lucide-react";

export function SocialRender({ config }: BlockRenderProps<SocialConfig>) {
  const links = (config.links ?? []).filter((l) => l.url);
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-2">
      {links.map((link, i) => (
        <a
          key={`${link.provider}-${i}`}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label ?? link.provider}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {link.provider === "website" ? (
            <Globe className="h-4 w-4" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </a>
      ))}
    </div>
  );
}
