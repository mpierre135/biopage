"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { SocialConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const PROVIDERS = [
  "instagram",
  "tiktok",
  "youtube",
  "x",
  "linkedin",
  "github",
  "facebook",
  "website",
];

export function SocialEditor({ config, onChange }: BlockEditorProps<SocialConfig>) {
  const links = config.links ?? [];

  function updateLink(index: number, patch: Partial<(typeof links)[number]>) {
    const next = links.map((l, i) => (i === index ? { ...l, ...patch } : l));
    onChange({ ...config, links: next });
  }

  function addLink() {
    onChange({
      ...config,
      links: [...links, { provider: "instagram", url: "" }],
    });
  }

  function removeLink(index: number) {
    onChange({ ...config, links: links.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      {links.map((link, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`social-provider-${index}`}>Provider</Label>
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="rounded p-1 text-muted-foreground hover:text-destructive cursor-pointer"
              aria-label="Remove social link"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <select
            id={`social-provider-${index}`}
            value={link.provider}
            onChange={(e) => updateLink(index, { provider: e.target.value })}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <Input
            value={link.url}
            onChange={(e) => updateLink(index, { url: e.target.value })}
            placeholder="https://"
            className="min-h-11"
          />
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addLink} className="min-h-11 cursor-pointer gap-2">
        <Plus className="h-4 w-4" />
        Add social link
      </Button>
    </div>
  );
}
