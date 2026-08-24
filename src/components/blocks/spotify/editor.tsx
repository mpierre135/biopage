"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { SpotifyConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SpotifyEditor({ config, onChange }: BlockEditorProps<SpotifyConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="spotify-url">Spotify URL</Label>
        <Input
          id="spotify-url"
          value={config.url ?? ""}
          onChange={(e) => onChange({ ...config, url: e.target.value })}
          placeholder="https://open.spotify.com/track/..."
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="spotify-title">Title (optional)</Label>
        <Input
          id="spotify-title"
          value={config.title ?? ""}
          onChange={(e) =>
            onChange({ ...config, title: e.target.value || undefined })
          }
          placeholder="Track or playlist name"
        />
      </div>
    </div>
  );
}
