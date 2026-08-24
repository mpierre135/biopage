"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/lib/actions/profile";

export function SettingsForm({
  profileId,
  initial,
}: {
  profileId: string;
  initial: {
    displayName: string;
    bio: string;
    location: string;
    seoTitle: string;
    seoDescription: string;
  };
}) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateProfile(profileId, form);
      if (result.success) toast.success("Saved");
      else toast.error(result.error ?? "Failed to save");
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      {(
        [
          ["displayName", "Display name", "input"],
          ["bio", "Bio", "textarea"],
          ["location", "Location", "input"],
          ["seoTitle", "SEO title", "input"],
          ["seoDescription", "SEO description", "textarea"],
        ] as const
      ).map(([key, label, kind]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          {kind === "textarea" ? (
            <Textarea
              id={key}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="min-h-24"
            />
          ) : (
            <Input
              id={key}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="min-h-11"
            />
          )}
        </div>
      ))}
      <Button
        className="min-h-11 cursor-pointer"
        onClick={save}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          "Save changes"
        )}
      </Button>
    </div>
  );
}
