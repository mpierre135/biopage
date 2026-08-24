"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { DigitalProductConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function DigitalProductEditor({
  config,
  onChange,
}: BlockEditorProps<DigitalProductConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="dp-title">Product name</Label>
        <Input
          id="dp-title"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="My Digital Guide"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dp-desc">Description (optional)</Label>
        <Textarea
          id="dp-desc"
          value={config.description ?? ""}
          onChange={(e) =>
            onChange({ ...config, description: e.target.value || undefined })
          }
          placeholder="What's included in this download?"
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dp-price">Price</Label>
          <Input
            id="dp-price"
            value={config.price ?? ""}
            onChange={(e) => onChange({ ...config, price: e.target.value })}
            placeholder="9.99"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dp-filetype">File type label</Label>
          <Input
            id="dp-filetype"
            value={config.fileType ?? ""}
            onChange={(e) =>
              onChange({ ...config, fileType: e.target.value || undefined })
            }
            placeholder="PDF, ZIP, MP4…"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dp-thumbnail">Thumbnail URL (optional)</Label>
        <Input
          id="dp-thumbnail"
          type="url"
          value={config.thumbnail ?? ""}
          onChange={(e) =>
            onChange({ ...config, thumbnail: e.target.value || undefined })
          }
          placeholder="https://example.com/cover.jpg"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dp-btn">Button text</Label>
        <Input
          id="dp-btn"
          value={config.buttonText ?? "Get Instant Access"}
          onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
          placeholder="Get Instant Access"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <p className="text-sm font-medium">Show price</p>
        <Switch
          checked={config.showPrice ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showPrice: checked })}
        />
      </div>
    </div>
  );
}
