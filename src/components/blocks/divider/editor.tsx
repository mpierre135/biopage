"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { DividerConfig } from "./index";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DividerEditor({ config, onChange }: BlockEditorProps<DividerConfig>) {
  return (
    <div className="space-y-1.5">
      <Label>Style</Label>
      <Select
        value={config.style ?? "line"}
        onValueChange={(value) =>
          onChange({ ...config, style: value as DividerConfig["style"] })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="line">Line</SelectItem>
          <SelectItem value="dots">Dots</SelectItem>
          <SelectItem value="space">Space</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
