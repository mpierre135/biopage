"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { FormConfig, FormField } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

const FIELD_TYPES: FormField["type"][] = ["text", "email", "textarea", "select"];

function newFieldId() {
  return `field_${Math.random().toString(36).slice(2, 10)}`;
}

export function FormEditor({ config, onChange }: BlockEditorProps<FormConfig>) {
  const fields = config.fields ?? [];

  function updateField(index: number, patch: Partial<FormField>) {
    onChange({
      ...config,
      fields: fields.map((field, i) =>
        i === index ? { ...field, ...patch } : field,
      ),
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="form-headline">Headline</Label>
        <Input
          id="form-headline"
          value={config.headline ?? ""}
          onChange={(e) =>
            onChange({ ...config, headline: e.target.value || undefined })
          }
          placeholder="Get in touch"
          className="min-h-11"
        />
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="space-y-3 rounded-lg border border-border p-3"
        >
          <div className="flex items-center justify-between">
            <Label>Field {index + 1}</Label>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...config,
                  fields: fields.filter((_, i) => i !== index),
                })
              }
              className="cursor-pointer text-muted-foreground hover:text-destructive"
              aria-label="Remove field"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`form-label-${field.id}`}>Label</Label>
            <Input
              id={`form-label-${field.id}`}
              value={field.label}
              onChange={(e) => updateField(index, { label: e.target.value })}
              className="min-h-11"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`form-type-${field.id}`}>Type</Label>
            <select
              id={`form-type-${field.id}`}
              value={field.type}
              onChange={(e) =>
                updateField(index, {
                  type: e.target.value as FormField["type"],
                  options:
                    e.target.value === "select"
                      ? field.options ?? ["Option 1", "Option 2"]
                      : undefined,
                })
              }
              className="border-input bg-background min-h-11 w-full cursor-pointer rounded-md border px-3 text-sm"
            >
              {FIELD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {field.type === "select" && (
            <div className="space-y-1.5">
              <Label htmlFor={`form-options-${field.id}`}>
                Options (one per line)
              </Label>
              <Textarea
                id={`form-options-${field.id}`}
                value={(field.options ?? []).join("\n")}
                onChange={(e) =>
                  updateField(index, {
                    options: e.target.value
                      .split("\n")
                      .map((o) => o.trim())
                      .filter(Boolean),
                  })
                }
                className="min-h-20"
              />
            </div>
          )}

          <div className="flex min-h-11 items-center justify-between rounded-lg border border-border px-3">
            <p className="text-sm font-medium">Required</p>
            <Switch
              checked={field.required}
              onCheckedChange={(checked) =>
                updateField(index, { required: checked })
              }
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="min-h-11 cursor-pointer gap-2"
        onClick={() =>
          onChange({
            ...config,
            fields: [
              ...fields,
              {
                id: newFieldId(),
                type: "text",
                label: "New field",
                required: false,
              },
            ],
          })
        }
      >
        <Plus className="h-4 w-4" />
        Add field
      </Button>

      <div className="space-y-1.5">
        <Label htmlFor="form-submit-label">Submit button label</Label>
        <Input
          id="form-submit-label"
          value={config.submitLabel ?? "Submit"}
          onChange={(e) =>
            onChange({ ...config, submitLabel: e.target.value || "Submit" })
          }
          className="min-h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="form-success">Success message</Label>
        <Input
          id="form-success"
          value={config.successMessage ?? ""}
          onChange={(e) =>
            onChange({
              ...config,
              successMessage: e.target.value || "Thanks! We got your response.",
            })
          }
          className="min-h-11"
        />
      </div>
    </div>
  );
}
