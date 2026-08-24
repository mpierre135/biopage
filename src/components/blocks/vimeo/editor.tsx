"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { VimeoConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VimeoEditor({ config, onChange }: BlockEditorProps<VimeoConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="vimeo-url">Vimeo URL or ID</Label>
        <Input
          id="vimeo-url"
          value={config.url ?? config.videoId ?? ""}
          onChange={(e) =>
            onChange({ ...config, url: e.target.value, videoId: undefined })
          }
          placeholder="https://vimeo.com/123456789"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="vimeo-title">Title (optional)</Label>
        <Input
          id="vimeo-title"
          value={config.title ?? ""}
          onChange={(e) =>
            onChange({ ...config, title: e.target.value || undefined })
          }
          placeholder="Video title"
        />
      </div>
    </div>
  );
}
