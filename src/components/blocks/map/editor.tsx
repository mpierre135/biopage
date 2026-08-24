"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { MapConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MapEditor({ config, onChange }: BlockEditorProps<MapConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="map-title">Title</Label>
        <Input
          id="map-title"
          value={config.title ?? ""}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="map-query">Location</Label>
        <Input
          id="map-query"
          value={config.query ?? ""}
          onChange={(e) => onChange({ ...config, query: e.target.value })}
          placeholder="Address or place name"
          className="min-h-11"
        />
      </div>
    </div>
  );
}
