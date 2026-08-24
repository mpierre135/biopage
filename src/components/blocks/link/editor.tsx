"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { LinkConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LinkEditor({ config, onChange }: BlockEditorProps<LinkConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="link-title">Title</Label>
        <Input
          id="link-title"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="My awesome link"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="link-url">URL</Label>
        <Input
          id="link-url"
          type="url"
          value={config.url}
          onChange={(e) => onChange({ ...config, url: e.target.value })}
          placeholder="https://example.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="link-thumbnail">Thumbnail URL (optional)</Label>
        <Input
          id="link-thumbnail"
          type="url"
          value={config.thumbnail ?? ""}
          onChange={(e) =>
            onChange({ ...config, thumbnail: e.target.value || undefined })
          }
          placeholder="https://example.com/image.png"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Style</Label>
          <Select
            value={config.style ?? "standard"}
            onValueChange={(v) =>
              onChange({ ...config, style: v as LinkConfig["style"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="thumbnail">Thumbnail</SelectItem>
              <SelectItem value="hero">Hero</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Animation</Label>
          <Select
            value={config.animation ?? "none"}
            onValueChange={(v) =>
              onChange({ ...config, animation: v as LinkConfig["animation"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="pulse">Pulse</SelectItem>
              <SelectItem value="shake">Shake on hover</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
