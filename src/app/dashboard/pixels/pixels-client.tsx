"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  removePixel,
  setPixelEnabled,
  upsertPixel,
  type PixelProvider,
} from "@/lib/actions/growth";

const PROVIDERS: { id: PixelProvider; label: string; hint: string }[] = [
  {
    id: "facebook_pixel",
    label: "Meta Pixel",
    hint: "Facebook / Instagram ads pixel ID",
  },
  {
    id: "google_analytics",
    label: "Google Analytics",
    hint: "Measurement ID (G-XXXXXXXX)",
  },
  {
    id: "tiktok_pixel",
    label: "TikTok Pixel",
    hint: "TikTok Events pixel ID",
  },
];

type PixelRow = {
  provider: string;
  pixelId: string;
  enabled: boolean;
};

export function PixelsClient({
  canUse,
  initial,
}: {
  canUse: boolean;
  initial: PixelRow[];
}) {
  const [rows, setRows] = useState(initial);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const p of PROVIDERS) {
      map[p.id] = initial.find((r) => r.provider === p.id)?.pixelId ?? "";
    }
    return map;
  });
  const [pending, startTransition] = useTransition();

  function save(provider: PixelProvider) {
    startTransition(async () => {
      const result = await upsertPixel(provider, drafts[provider] ?? "", true);
      if (!result.success) {
        toast.error(result.error ?? "Failed to save");
        return;
      }
      setRows((prev) => {
        const others = prev.filter((r) => r.provider !== provider);
        return [
          ...others,
          { provider, pixelId: drafts[provider] ?? "", enabled: true },
        ];
      });
      toast.success("Pixel saved");
    });
  }

  function toggle(provider: PixelProvider, enabled: boolean) {
    startTransition(async () => {
      const result = await setPixelEnabled(provider, enabled);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update");
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.provider === provider ? { ...r, enabled } : r)),
      );
    });
  }

  function remove(provider: PixelProvider) {
    startTransition(async () => {
      const result = await removePixel(provider);
      if (!result.success) {
        toast.error(result.error ?? "Failed to remove");
        return;
      }
      setRows((prev) => prev.filter((r) => r.provider !== provider));
      setDrafts((d) => ({ ...d, [provider]: "" }));
      toast.success("Pixel removed");
    });
  }

  if (!canUse) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Upgrade to Pro to add Meta, Google, and TikTok pixels on your public
          page.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {PROVIDERS.map((p) => {
        const existing = rows.find((r) => r.provider === p.id);
        return (
          <Card key={p.id}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">{p.label}</h3>
                  <p className="text-xs text-muted-foreground">{p.hint}</p>
                </div>
                {existing ? (
                  <Switch
                    checked={existing.enabled}
                    onCheckedChange={(v) => toggle(p.id, v)}
                    disabled={pending}
                    className="cursor-pointer"
                  />
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor={p.id}>Pixel ID</Label>
                <Input
                  id={p.id}
                  value={drafts[p.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [p.id]: e.target.value }))
                  }
                  className="min-h-11"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="min-h-11 cursor-pointer"
                  disabled={pending}
                  onClick={() => save(p.id)}
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
                {existing ? (
                  <Button
                    variant="outline"
                    className="min-h-11 cursor-pointer gap-2"
                    disabled={pending}
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
