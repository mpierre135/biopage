"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { ProductConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function ProductEditor({ config, onChange }: BlockEditorProps<ProductConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="prod-title">Product name</Label>
        <Input
          id="prod-title"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Amazing Product"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prod-desc">Description (optional)</Label>
        <Textarea
          id="prod-desc"
          value={config.description ?? ""}
          onChange={(e) =>
            onChange({ ...config, description: e.target.value || undefined })
          }
          placeholder="Short product description"
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="prod-price">Price</Label>
          <Input
            id="prod-price"
            value={config.price ?? ""}
            onChange={(e) => onChange({ ...config, price: e.target.value })}
            placeholder="29.99"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prod-currency">Currency</Label>
          <Input
            id="prod-currency"
            value={config.currency ?? "usd"}
            onChange={(e) => onChange({ ...config, currency: e.target.value })}
            placeholder="usd"
            maxLength={3}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prod-thumbnail">Thumbnail URL (optional)</Label>
        <Input
          id="prod-thumbnail"
          type="url"
          value={config.thumbnail ?? ""}
          onChange={(e) =>
            onChange({ ...config, thumbnail: e.target.value || undefined })
          }
          placeholder="https://example.com/product.jpg"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="prod-btn">Button text</Label>
        <Input
          id="prod-btn"
          value={config.buttonText ?? "Buy Now"}
          onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
          placeholder="Buy Now"
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
