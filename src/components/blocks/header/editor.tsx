"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { HeaderConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function HeaderEditor({ config, onChange }: BlockEditorProps<HeaderConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="header-text">Heading text</Label>
        <Input
          id="header-text"
          value={config.text}
          onChange={(e) => onChange({ ...config, text: e.target.value })}
          placeholder="Your heading here"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Size</Label>
        <Select
          value={config.size ?? "md"}
          onValueChange={(value) =>
            onChange({ ...config, size: value as HeaderConfig["size"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
