"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { AppleMusicConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AppleMusicEditor({
  config,
  onChange,
}: BlockEditorProps<AppleMusicConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="apple-music-url">Apple Music URL</Label>
        <Input
          id="apple-music-url"
          value={config.url ?? ""}
          onChange={(e) =>
            onChange({ ...config, url: e.target.value || undefined })
          }
          placeholder="https://music.apple.com/..."
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="apple-music-title">Title (optional)</Label>
        <Input
          id="apple-music-title"
          value={config.title ?? ""}
          onChange={(e) =>
            onChange({ ...config, title: e.target.value || undefined })
          }
          placeholder="Song or album name"
          className="min-h-11"
        />
      </div>
    </div>
  );
}
