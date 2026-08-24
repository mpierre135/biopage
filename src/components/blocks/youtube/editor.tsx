"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { YoutubeConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function YoutubeEditor({ config, onChange }: BlockEditorProps<YoutubeConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="yt-url">YouTube URL or Video ID</Label>
        <Input
          id="yt-url"
          value={config.url ?? config.videoId ?? ""}
          onChange={(e) => onChange({ ...config, url: e.target.value, videoId: undefined })}
          placeholder="https://youtube.com/watch?v=... or video ID"
        />
        <p className="text-xs text-muted-foreground">
          Paste a YouTube link or the 11-character video ID.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="yt-title">Title (optional)</Label>
        <Input
          id="yt-title"
          value={config.title ?? ""}
          onChange={(e) => onChange({ ...config, title: e.target.value || undefined })}
          placeholder="Video title for accessibility"
        />
      </div>
    </div>
  );
}
