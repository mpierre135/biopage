"use client";

import { useTransition } from "react";
import { Check, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import { THEME_PRESETS } from "@/lib/themes/presets";
import { updateProfile } from "@/lib/actions/profile";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ThemePicker({
  profileId,
  currentThemeSlug,
  canUsePremium,
}: {
  profileId: string;
  currentThemeSlug: string | null;
  canUsePremium: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function selectTheme(slug: string, isPremium: boolean) {
    if (isPremium && !canUsePremium) {
      toast.error("Upgrade to Pro to use premium themes");
      return;
    }

    const preset = THEME_PRESETS.find((t) => t.slug === slug);
    if (!preset) return;

    startTransition(async () => {
      const result = await updateProfile(profileId, {
        designConfig: { ...preset.config, slug: preset.slug },
        themeId: null,
      });
      if (!result.success) {
        toast.error(result.error ?? "Could not apply theme");
        return;
      }
      toast.success(`Applied ${preset.name}`);
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {THEME_PRESETS.map((preset) => {
        const bg =
          preset.config.background?.gradient ??
          preset.config.background?.color ??
          "#fff";
        const selected = currentThemeSlug === preset.slug;
        const locked = preset.isPremium && !canUsePremium;

        return (
          <button
            key={preset.slug}
            type="button"
            disabled={pending || locked}
            onClick={() => selectTheme(preset.slug, !!preset.isPremium)}
            className={cn(
              "group relative overflow-hidden rounded-xl border text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-indigo-500 ring-2 ring-indigo-200"
                : "border-border hover:shadow-md",
              locked && "opacity-60 cursor-not-allowed",
            )}
          >
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div
                  className="flex h-32 flex-col items-center justify-center gap-2 p-4"
                  style={{
                    background: bg,
                    color: preset.config.colors?.text ?? "#000",
                  }}
                >
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{
                      backgroundColor: preset.config.colors?.primary ?? "#6366f1",
                    }}
                  />
                  {selected && (
                    <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {preset.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {preset.category}
                      {preset.isPremium && " · Premium"}
                    </p>
                  </div>
                  {preset.isPremium && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      Pro
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
      {THEME_PRESETS.length === 0 && (
        <div className="col-span-full flex flex-col items-center py-12 text-muted-foreground">
          <Palette className="h-10 w-10 opacity-40" />
          <p className="mt-3 text-sm">No themes available yet.</p>
        </div>
      )}
      {pending && (
        <div className="col-span-full flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Applying theme…
        </div>
      )}
    </div>
  );
}
