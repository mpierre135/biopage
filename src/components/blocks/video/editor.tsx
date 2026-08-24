"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { VideoConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VideoEditor({ config, onChange }: BlockEditorProps<VideoConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          type="url"
          value={config.url ?? ""}
          onChange={(e) =>
            onChange({ ...config, url: e.target.value || undefined })
          }
          placeholder="https://example.com/video.mp4"
          className="min-h-11"
        />
        <p className="text-xs text-muted-foreground">
          Direct link to an MP4 or WebM file.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="video-title">Title (optional)</Label>
        <Input
          id="video-title"
          value={config.title ?? ""}
          onChange={(e) =>
            onChange({ ...config, title: e.target.value || undefined })
          }
          placeholder="Video title"
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="video-poster">Poster image URL (optional)</Label>
        <Input
          id="video-poster"
          type="url"
          value={config.poster ?? ""}
          onChange={(e) =>
            onChange({ ...config, poster: e.target.value || undefined })
          }
          placeholder="https://example.com/poster.jpg"
          className="min-h-11"
        />
      </div>
    </div>
  );
}
