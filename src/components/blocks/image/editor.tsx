"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { ImageConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ImageEditor({ config, onChange }: BlockEditorProps<ImageConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="img-url">Image URL</Label>
        <Input
          id="img-url"
          type="url"
          value={config.url}
          onChange={(e) => onChange({ ...config, url: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="img-alt">Alt text</Label>
        <Input
          id="img-alt"
          value={config.alt ?? ""}
          onChange={(e) => onChange({ ...config, alt: e.target.value })}
          placeholder="Describe the image..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="img-link">Link URL (optional)</Label>
        <Input
          id="img-link"
          type="url"
          value={config.linkUrl ?? ""}
          onChange={(e) =>
            onChange({ ...config, linkUrl: e.target.value || undefined })
          }
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
}
