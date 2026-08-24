"use client";

import { BlockRenderProps } from "@/lib/blocks/types";
import { ContactConfig } from "./index";
import { Mail, MapPin, Phone, Globe } from "lucide-react";

export function ContactRender({ config }: BlockRenderProps<ContactConfig>) {
  const rows = [
    config.email && { icon: Mail, href: `mailto:${config.email}`, text: config.email },
    config.phone && { icon: Phone, href: `tel:${config.phone}`, text: config.phone },
    config.location && { icon: MapPin, href: undefined, text: config.location },
    config.website && { icon: Globe, href: config.website, text: config.website },
  ].filter(Boolean) as {
    icon: typeof Mail;
    href?: string;
    text: string;
  }[];

  if (rows.length === 0) return null;

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-4">
      {rows.map((row) => {
        const Icon = row.icon;
        const content = (
          <span className="flex items-center gap-3 text-sm text-foreground">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{row.text}</span>
          </span>
        );
        return row.href ? (
          <a
            key={row.text}
            href={row.href}
            target={row.href.startsWith("http") ? "_blank" : undefined}
            rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="block min-h-11 rounded-lg px-2 py-2 hover:bg-accent cursor-pointer"
          >
            {content}
          </a>
        ) : (
          <div key={row.text} className="min-h-11 px-2 py-2">
            {content}
          </div>
        );
      })}
    </div>
  );
}
