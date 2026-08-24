"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { ContactConfig } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactEditor({ config, onChange }: BlockEditorProps<ContactConfig>) {
  return (
    <div className="space-y-4">
      {(
        [
          ["email", "Email", "you@example.com"],
          ["phone", "Phone", "+1 555 000 0000"],
          ["location", "Location", "City, Country"],
          ["website", "Website", "https://"],
        ] as const
      ).map(([key, label, placeholder]) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`contact-${key}`}>{label}</Label>
          <Input
            id={`contact-${key}`}
            value={config[key] ?? ""}
            onChange={(e) =>
              onChange({ ...config, [key]: e.target.value || undefined })
            }
            placeholder={placeholder}
            className="min-h-11"
          />
        </div>
      ))}
    </div>
  );
}
