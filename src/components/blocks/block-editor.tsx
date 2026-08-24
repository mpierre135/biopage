"use client";

import { getBlock } from "@/lib/blocks/registry";
import { BlockType } from "@/lib/blocks/types";
import { AlertCircle } from "lucide-react";

interface BlockEditorProps {
  type: BlockType;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function BlockEditor({ type, config, onChange }: BlockEditorProps) {
  const descriptor = getBlock(type);

  if (!descriptor) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <AlertCircle className="size-4 shrink-0" />
        Unknown block type: <code className="font-mono text-xs">{type}</code>
      </div>
    );
  }

  const parsed = descriptor.schema.safeParse(config);
  const safeConfig = parsed.success ? parsed.data : config;

  const { Editor } = descriptor;

  return (
    <Editor
      config={safeConfig}
      onChange={onChange}
    />
  );
}
