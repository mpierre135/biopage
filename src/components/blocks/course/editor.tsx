"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { CourseConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CourseEditor({ config, onChange }: BlockEditorProps<CourseConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="course-title">Title</Label>
        <Input
          id="course-title"
          value={config.title ?? ""}
          onChange={(e) =>
            onChange({ ...config, title: e.target.value || undefined })
          }
          placeholder="Course name"
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="course-desc">Description</Label>
        <Textarea
          id="course-desc"
          value={config.description ?? ""}
          onChange={(e) =>
            onChange({ ...config, description: e.target.value || undefined })
          }
          placeholder="What students will learn"
          rows={3}
          className="resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="course-price">Price</Label>
          <Input
            id="course-price"
            type="number"
            min={0}
            step="0.01"
            value={config.price ?? ""}
            onChange={(e) =>
              onChange({
                ...config,
                price: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="49"
            className="min-h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="course-currency">Currency</Label>
          <Input
            id="course-currency"
            value={config.currency ?? "usd"}
            onChange={(e) =>
              onChange({ ...config, currency: e.target.value || "usd" })
            }
            placeholder="usd"
            maxLength={3}
            className="min-h-11"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="course-cta">Enrollment URL</Label>
        <Input
          id="course-cta"
          type="url"
          value={config.ctaUrl ?? ""}
          onChange={(e) =>
            onChange({ ...config, ctaUrl: e.target.value || undefined })
          }
          placeholder="https://..."
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="course-thumb">Thumbnail URL</Label>
        <Input
          id="course-thumb"
          type="url"
          value={config.thumbnail ?? ""}
          onChange={(e) =>
            onChange({ ...config, thumbnail: e.target.value || undefined })
          }
          placeholder="https://example.com/course.jpg"
          className="min-h-11"
        />
      </div>
    </div>
  );
}
