"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { EmailCaptureConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function EmailCaptureEditor({
  config,
  onChange,
}: BlockEditorProps<EmailCaptureConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ec-headline">Headline</Label>
        <Input
          id="ec-headline"
          value={config.headline}
          onChange={(e) => onChange({ ...config, headline: e.target.value })}
          placeholder="Join my newsletter"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ec-btn">Button text</Label>
        <Input
          id="ec-btn"
          value={config.buttonText}
          onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
          placeholder="Subscribe"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ec-success">Success message</Label>
        <Input
          id="ec-success"
          value={config.successMessage}
          onChange={(e) => onChange({ ...config, successMessage: e.target.value })}
          placeholder="You're in! Thanks for signing up."
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Collect first name</p>
          <p className="text-xs text-muted-foreground">Ask for first name alongside email</p>
        </div>
        <Switch
          checked={config.collectFirstName ?? false}
          onCheckedChange={(checked) =>
            onChange({ ...config, collectFirstName: checked })
          }
        />
      </div>
    </div>
  );
}
