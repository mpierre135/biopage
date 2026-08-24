"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { DonationConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function DonationEditor({
  config,
  onChange,
}: BlockEditorProps<DonationConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="donation-title">Title</Label>
        <Input
          id="donation-title"
          value={config.title ?? ""}
          onChange={(e) =>
            onChange({ ...config, title: e.target.value || undefined })
          }
          placeholder="Support my work"
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="donation-desc">Description</Label>
        <Textarea
          id="donation-desc"
          value={config.description ?? ""}
          onChange={(e) =>
            onChange({ ...config, description: e.target.value || undefined })
          }
          placeholder="Optional message"
          rows={2}
          className="resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="donation-amounts">
          Amounts (comma-separated numbers)
        </Label>
        <Input
          id="donation-amounts"
          value={(config.amounts ?? []).join(", ")}
          onChange={(e) => {
            const amounts = e.target.value
              .split(",")
              .map((v) => Number(v.trim()))
              .filter((n) => !Number.isNaN(n) && n > 0);
            onChange({ ...config, amounts });
          }}
          placeholder="5, 10, 25"
          className="min-h-11"
        />
      </div>
      <div className="flex min-h-11 items-center justify-between rounded-lg border border-border px-4">
        <p className="text-sm font-medium">Allow custom amount</p>
        <Switch
          checked={config.customAmount ?? false}
          onCheckedChange={(checked) =>
            onChange({ ...config, customAmount: checked })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="donation-url">Donate URL</Label>
        <Input
          id="donation-url"
          type="url"
          value={config.donateUrl ?? ""}
          onChange={(e) =>
            onChange({ ...config, donateUrl: e.target.value || undefined })
          }
          placeholder="https://buy.stripe.com/..."
          className="min-h-11"
        />
      </div>
    </div>
  );
}
