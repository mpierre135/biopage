"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { TestimonialConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TestimonialEditor({
  config,
  onChange,
}: BlockEditorProps<TestimonialConfig>) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="testimonial-quote">Quote</Label>
        <Textarea
          id="testimonial-quote"
          value={config.quote ?? ""}
          onChange={(e) =>
            onChange({ ...config, quote: e.target.value || undefined })
          }
          placeholder="What they said…"
          rows={4}
          className="resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="testimonial-author">Author</Label>
        <Input
          id="testimonial-author"
          value={config.author ?? ""}
          onChange={(e) =>
            onChange({ ...config, author: e.target.value || undefined })
          }
          placeholder="Jane Doe"
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="testimonial-role">Role (optional)</Label>
        <Input
          id="testimonial-role"
          value={config.role ?? ""}
          onChange={(e) =>
            onChange({ ...config, role: e.target.value || undefined })
          }
          placeholder="Founder, Acme"
          className="min-h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="testimonial-avatar">Avatar URL (optional)</Label>
        <Input
          id="testimonial-avatar"
          type="url"
          value={config.avatarUrl ?? ""}
          onChange={(e) =>
            onChange({ ...config, avatarUrl: e.target.value || undefined })
          }
          placeholder="https://example.com/avatar.jpg"
          className="min-h-11"
        />
      </div>
    </div>
  );
}
