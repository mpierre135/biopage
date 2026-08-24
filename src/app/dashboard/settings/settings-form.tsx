"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { updateProfile } from "@/lib/actions/profile";

export function SettingsForm({
  profileId,
  canRemoveBranding,
  canCustomDomain,
  initial,
}: {
  profileId: string;
  canRemoveBranding: boolean;
  canCustomDomain: boolean;
  initial: {
    displayName: string;
    bio: string;
    location: string;
    seoTitle: string;
    seoDescription: string;
    customDomain: string;
    isPublished: boolean;
    showBranding: boolean;
    visibility: "public" | "unlisted" | "private";
  };
}) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateProfile(profileId, {
        displayName: form.displayName,
        bio: form.bio,
        location: form.location,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        customDomain: canCustomDomain ? form.customDomain : "",
        isPublished: form.isPublished,
        showBranding: canRemoveBranding ? form.showBranding : true,
        visibility: form.visibility,
      });
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

      <div className="space-y-2">
        <Label htmlFor="customDomain">Custom domain</Label>
        <Input
          id="customDomain"
          placeholder="links.yourbrand.com"
          value={form.customDomain}
          disabled={!canCustomDomain}
          onChange={(e) =>
            setForm((f) => ({ ...f, customDomain: e.target.value }))
          }
          className="min-h-11"
        />
        <p className="text-xs text-muted-foreground">
          {canCustomDomain
            ? "Point a CNAME to your BioHub host, then enter the hostname here."
            : "Upgrade to Creator to connect a custom domain."}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <select
          id="visibility"
          value={form.visibility}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              visibility: e.target.value as typeof form.visibility,
            }))
          }
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
        <div>
          <p className="text-sm font-medium">Published</p>
          <p className="text-xs text-muted-foreground">
            Make your page live at /your-username
          </p>
        </div>
        <Switch
          checked={form.isPublished}
          onCheckedChange={(v) => setForm((f) => ({ ...f, isPublished: v }))}
          className="cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-3">
        <div>
          <p className="text-sm font-medium">Show BioHub branding</p>
          <p className="text-xs text-muted-foreground">
            {canRemoveBranding
              ? "Toggle the footer badge on your public page"
              : "Upgrade to Creator to hide branding"}
          </p>
        </div>
        <Switch
          checked={form.showBranding}
          disabled={!canRemoveBranding}
          onCheckedChange={(v) => setForm((f) => ({ ...f, showBranding: v }))}
          className="cursor-pointer"
        />
      </div>

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
