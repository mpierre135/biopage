"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { SoundCloudConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SoundCloudEditor({
  config,
  onChange,
}: BlockEditorProps<SoundCloudConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="soundcloud-url">SoundCloud URL</Label>
        <Input
          id="soundcloud-url"
          value={config.url ?? ""}
          onChange={(e) =>
            onChange({ ...config, url: e.target.value || undefined })
          }
          placeholder="https://soundcloud.com/..."
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="soundcloud-title">Title (optional)</Label>
        <Input
          id="soundcloud-title"
          value={config.title ?? ""}
          onChange={(e) =>
            onChange({ ...config, title: e.target.value || undefined })
          }
          placeholder="Track name"
          className="min-h-11"
        />
      </div>
    </div>
  );
}
