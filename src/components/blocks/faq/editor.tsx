"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { FaqConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function FaqEditor({ config, onChange }: BlockEditorProps<FaqConfig>) {
  const items = config.items ?? [];

  function update(index: number, patch: Partial<(typeof items)[number]>) {
    onChange({
      ...config,
      items: items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-border p-3">
          <div className="flex justify-between">
            <Label>Question {index + 1}</Label>
            <button
              type="button"
              onClick={() =>
                onChange({ ...config, items: items.filter((_, i) => i !== index) })
              }
              className="text-muted-foreground hover:text-destructive cursor-pointer"
              aria-label="Remove FAQ item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Input
            value={item.question}
            onChange={(e) => update(index, { question: e.target.value })}
            className="min-h-11"
          />
          <Textarea
            value={item.answer}
            onChange={(e) => update(index, { answer: e.target.value })}
            className="min-h-20"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="min-h-11 cursor-pointer gap-2"
        onClick={() =>
          onChange({
            ...config,
            items: [...items, { question: "", answer: "" }],
          })
        }
      >
        <Plus className="h-4 w-4" />
        Add question
      </Button>
    </div>
  );
}
