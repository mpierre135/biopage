"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { CountdownConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CountdownEditor({
  config,
  onChange,
}: BlockEditorProps<CountdownConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="countdown-title">Title</Label>
        <Input
          id="countdown-title"
          value={config.title ?? ""}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="countdown-date">Target date & time</Label>
        <Input
          id="countdown-date"
          type="datetime-local"
          value={config.targetDate ?? ""}
          onChange={(e) => onChange({ ...config, targetDate: e.target.value })}
          className="min-h-11"
        />
      </div>
    </div>
  );
}
