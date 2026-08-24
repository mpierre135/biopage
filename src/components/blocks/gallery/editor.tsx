"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { GalleryConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function GalleryEditor({
  config,
  onChange,
}: BlockEditorProps<GalleryConfig>) {
  const images = config.images ?? [];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="gallery-columns">Columns</Label>
        <select
          id="gallery-columns"
          value={config.columns ?? 2}
          onChange={(e) =>
            onChange({
              ...config,
              columns: Number(e.target.value) === 3 ? 3 : 2,
            })
          }
          className="border-input bg-background min-h-11 w-full cursor-pointer rounded-md border px-3 text-sm"
        >
          <option value={2}>2 columns</option>
          <option value={3}>3 columns</option>
        </select>
      </div>

      {images.map((image, index) => (
        <div
          key={index}
          className="space-y-2 rounded-lg border border-border p-3"
        >
          <div className="flex items-center justify-between">
            <Label>Image {index + 1}</Label>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...config,
                  images: images.filter((_, i) => i !== index),
                })
              }
              className="cursor-pointer text-muted-foreground hover:text-destructive"
              aria-label="Remove image"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Input
            type="url"
            value={image.url}
            onChange={(e) =>
              onChange({
                ...config,
                images: images.map((img, i) =>
                  i === index ? { ...img, url: e.target.value } : img,
                ),
              })
            }
            placeholder="https://example.com/photo.jpg"
            className="min-h-11"
          />
          <Input
            value={image.alt ?? ""}
            onChange={(e) =>
              onChange({
                ...config,
                images: images.map((img, i) =>
                  i === index
                    ? { ...img, alt: e.target.value || undefined }
                    : img,
                ),
              })
            }
            placeholder="Alt text (optional)"
            className="min-h-11"
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
            images: [...images, { url: "" }],
          })
        }
      >
        <Plus className="h-4 w-4" />
        Add image
      </Button>
    </div>
  );
}
