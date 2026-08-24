"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { TextConfig } from "./index";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TextEditor({ config, onChange }: BlockEditorProps<TextConfig>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="text-content">Content</Label>
      <Textarea
        id="text-content"
        value={config.content}
        onChange={(e) => onChange({ ...config, content: e.target.value })}
        placeholder="Add some text here..."
        rows={4}
        className="resize-none"
      />
    </div>
  );
}
