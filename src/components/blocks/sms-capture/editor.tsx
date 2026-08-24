"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { SmsCaptureConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SmsCaptureEditor({
  config,
  onChange,
}: BlockEditorProps<SmsCaptureConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="sms-headline">Headline</Label>
        <Input
          id="sms-headline"
          value={config.headline}
          onChange={(e) => onChange({ ...config, headline: e.target.value })}
          placeholder="Get text updates from me"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sms-btn">Button text</Label>
        <Input
          id="sms-btn"
          value={config.buttonText}
          onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
          placeholder="Text Me"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sms-success">Success message</Label>
        <Input
          id="sms-success"
          value={config.successMessage}
          onChange={(e) => onChange({ ...config, successMessage: e.target.value })}
          placeholder="Thanks! You'll hear from us soon."
        />
      </div>
    </div>
  );
}
