"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { BookingConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BookingEditor({
  config,
  onChange,
}: BlockEditorProps<BookingConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="booking-title">Title</Label>
        <Input
          id="booking-title"
          value={config.title ?? ""}
          onChange={(e) =>
            onChange({ ...config, title: e.target.value || undefined })
          }
          placeholder="Book a call"
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="booking-desc">Description</Label>
        <Textarea
          id="booking-desc"
          value={config.description ?? ""}
          onChange={(e) =>
            onChange({ ...config, description: e.target.value || undefined })
          }
          placeholder="What this session covers"
          rows={3}
          className="resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="booking-duration">Duration (minutes)</Label>
          <Input
            id="booking-duration"
            type="number"
            min={1}
            value={config.durationMinutes ?? ""}
            onChange={(e) =>
              onChange({
                ...config,
                durationMinutes: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            placeholder="30"
            className="min-h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-price">Price</Label>
          <Input
            id="booking-price"
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
            placeholder="0"
            className="min-h-11"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="booking-url">Booking URL</Label>
        <Input
          id="booking-url"
          type="url"
          value={config.bookingUrl ?? ""}
          onChange={(e) =>
            onChange({ ...config, bookingUrl: e.target.value || undefined })
          }
          placeholder="https://cal.com/..."
          className="min-h-11"
        />
      </div>
    </div>
  );
}
