"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { updateProfile } from "@/lib/actions/profile";
import {
  buildPageBackgroundStyle,
  backgroundOverlayStyle,
} from "@/lib/themes/resolver";
import type { ThemeConfig, ButtonRadius, ButtonStyle } from "@/lib/themes/types";

const FONT_OPTIONS = [
  { label: "System", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Geist", value: "var(--font-geist-sans), ui-sans-serif, sans-serif" },
  { label: "Serif", value: "ui-serif, Georgia, Cambria, serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
] as const;

const BUTTON_STYLES: ButtonStyle[] = [
  "filled",
  "outlined",
  "soft",
  "ghost",
  "shadow",
];
const BUTTON_RADII: ButtonRadius[] = ["none", "sm", "md", "lg", "xl", "full"];

type DesignConfig = ThemeConfig & { slug?: string };

function emptyCustom(base?: DesignConfig): DesignConfig {
  return {
    slug: "custom",
    background: {
      color: base?.background?.color ?? "#0f172a",
      gradient: base?.background?.gradient,
      imageUrl: base?.background?.imageUrl,
      imageSize: base?.background?.imageSize ?? "cover",
      imagePosition: base?.background?.imagePosition ?? "center",
      imageAttachment: base?.background?.imageAttachment ?? "scroll",
      overlayColor: base?.background?.overlayColor ?? "#000000",
      overlayOpacity: base?.background?.overlayOpacity ?? 0.35,
    },
    colors: {
      text: base?.colors?.text ?? "#f8fafc",
      textMuted: base?.colors?.textMuted ?? "#94a3b8",
      primary: base?.colors?.primary ?? "#818cf8",
    },
    typography: {
      family:
        base?.typography?.family ?? "ui-sans-serif, system-ui, sans-serif",
    },
    buttons: {
      style: base?.buttons?.style ?? "filled",
      radius: base?.buttons?.radius ?? "lg",
      backgroundColor: base?.buttons?.backgroundColor ?? "#818cf8",
      textColor: base?.buttons?.textColor ?? "#0f172a",
      borderColor: base?.buttons?.borderColor ?? "#818cf8",
    },
    cards: {
      backgroundColor:
        base?.cards?.backgroundColor ?? "rgba(255,255,255,0.08)",
      borderColor: base?.cards?.borderColor ?? "rgba(255,255,255,0.12)",
      borderRadius: base?.cards?.borderRadius ?? "16px",
    },
    layout: {
      containerMaxWidth: base?.layout?.containerMaxWidth ?? "28rem",
      blockGap: base?.layout?.blockGap ?? "12px",
    },
  };
}

export function CustomDesignEditor({
  profileId,
  canCustomize,
  initial,
}: {
  profileId: string;
  canCustomize: boolean;
  initial: DesignConfig;
}) {
  const [config, setConfig] = useState<DesignConfig>(() =>
    emptyCustom(initial),
  );
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function patchBackground(
    patch: Partial<NonNullable<ThemeConfig["background"]>>,
  ) {
    setConfig((c) => ({
      ...c,
      background: { ...c.background, ...patch },
    }));
  }

  async function uploadBackground(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      patchBackground({
        imageUrl: data.url,
        // Clear solid gradient so image is primary
        gradient: undefined,
      });
      toast.success("Background image uploaded");
    } finally {
      setUploading(false);
    }
  }

  function save() {
    if (!canCustomize) {
      toast.error("Upgrade to Creator to save custom designs");
      return;
    }
    startTransition(async () => {
      const payload: DesignConfig = {
        ...config,
        slug: "custom",
        background: {
          ...config.background,
          // Prefer image; keep color as fallback under image
          gradient: config.background?.imageUrl
            ? undefined
            : config.background?.gradient,
        },
      };
      const result = await updateProfile(profileId, {
        designConfig: payload,
        themeId: null,
      });
      if (!result.success) {
        toast.error(result.error ?? "Could not save design");
        return;
      }
      toast.success("Custom design saved");
    });
  }

  const previewStyle = buildPageBackgroundStyle(config);
  const overlay = backgroundOverlayStyle(config);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        <CardContent className="space-y-6 pt-6">
          {!canCustomize && (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Upgrade to Creator to save a fully custom design and background
              image.
            </p>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Background</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bg-color">Fallback color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bg-color"
                    type="color"
                    value={config.background?.color ?? "#0f172a"}
                    onChange={(e) => patchBackground({ color: e.target.value })}
                    className="h-11 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={config.background?.color ?? ""}
                    onChange={(e) => patchBackground({ color: e.target.value })}
                    className="min-h-11 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bg-gradient">Gradient (optional)</Label>
                <Input
                  id="bg-gradient"
                  placeholder="linear-gradient(...)"
                  value={config.background?.gradient ?? ""}
                  disabled={Boolean(config.background?.imageUrl)}
                  onChange={(e) =>
                    patchBackground({
                      gradient: e.target.value || undefined,
                    })
                  }
                  className="min-h-11 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background image</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadBackground(file);
                  e.target.value = "";
                }}
              />
              {config.background?.imageUrl ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element -- uploaded / remote background URL */}
                  <img
                    src={config.background.imageUrl}
                    alt="Background preview"
                    className="h-36 w-full object-cover"
                  />
                  <div className="flex flex-wrap gap-2 p-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 cursor-pointer gap-2"
                      disabled={uploading || !canCustomize}
                      onClick={() => fileRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ImagePlus className="size-4" />
                      )}
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-11 cursor-pointer gap-2"
                      onClick={() =>
                        patchBackground({ imageUrl: undefined })
                      }
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full cursor-pointer gap-2"
                  disabled={uploading || !canCustomize}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="size-4" />
                  )}
                  Upload background image
                </Button>
              )}
            </div>

            {config.background?.imageUrl ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="overlay-opacity">
                    Overlay opacity (
                    {Math.round((config.background.overlayOpacity ?? 0) * 100)}
                    %)
                  </Label>
                  <input
                    id="overlay-opacity"
                    type="range"
                    min={0}
                    max={80}
                    value={Math.round(
                      (config.background.overlayOpacity ?? 0) * 100,
                    )}
                    onChange={(e) =>
                      patchBackground({
                        overlayOpacity: Number(e.target.value) / 100,
                      })
                    }
                    className="w-full cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overlay-color">Overlay color</Label>
                  <Input
                    id="overlay-color"
                    type="color"
                    value={config.background.overlayColor ?? "#000000"}
                    onChange={(e) =>
                      patchBackground({ overlayColor: e.target.value })
                    }
                    className="h-11 w-full cursor-pointer p-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-size">Image fit</Label>
                  <select
                    id="bg-size"
                    value={config.background.imageSize ?? "cover"}
                    onChange={(e) =>
                      patchBackground({ imageSize: e.target.value })
                    }
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-attach">Scroll behavior</Label>
                  <select
                    id="bg-attach"
                    value={config.background.imageAttachment ?? "scroll"}
                    onChange={(e) =>
                      patchBackground({
                        imageAttachment: e.target.value as
                          | "scroll"
                          | "fixed"
                          | "local",
                      })
                    }
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="scroll">Scroll with page</option>
                    <option value="fixed">Fixed (parallax)</option>
                  </select>
                </div>
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Colors</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["text", "Text"],
                  ["textMuted", "Muted text"],
                  ["primary", "Accent"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`color-${key}`}>{label}</Label>
                  <Input
                    id={`color-${key}`}
                    type="color"
                    value={config.colors?.[key] ?? "#ffffff"}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        colors: { ...c.colors, [key]: e.target.value },
                      }))
                    }
                    className="h-11 w-full cursor-pointer p-1"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Typography</h3>
            <div className="space-y-2">
              <Label htmlFor="font-family">Font</Label>
              <select
                id="font-family"
                value={config.typography?.family ?? FONT_OPTIONS[0].value}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    typography: { ...c.typography, family: e.target.value },
                  }))
                }
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Buttons</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="btn-style">Style</Label>
                <select
                  id="btn-style"
                  value={config.buttons?.style ?? "filled"}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      buttons: {
                        ...c.buttons,
                        style: e.target.value as ButtonStyle,
                      },
                    }))
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm capitalize"
                >
                  {BUTTON_STYLES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="btn-radius">Corners</Label>
                <select
                  id="btn-radius"
                  value={config.buttons?.radius ?? "lg"}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      buttons: {
                        ...c.buttons,
                        radius: e.target.value as ButtonRadius,
                      },
                    }))
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {BUTTON_RADII.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="btn-bg">Button color</Label>
                <Input
                  id="btn-bg"
                  type="color"
                  value={config.buttons?.backgroundColor ?? "#818cf8"}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      buttons: {
                        ...c.buttons,
                        backgroundColor: e.target.value,
                        borderColor: e.target.value,
                      },
                    }))
                  }
                  className="h-11 w-full cursor-pointer p-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="btn-text">Button text</Label>
                <Input
                  id="btn-text"
                  type="color"
                  value={config.buttons?.textColor ?? "#0f172a"}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      buttons: { ...c.buttons, textColor: e.target.value },
                    }))
                  }
                  className="h-11 w-full cursor-pointer p-1"
                />
              </div>
            </div>
          </section>

          <Button
            className="min-h-11 cursor-pointer"
            disabled={pending || !canCustomize}
            onClick={save}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save custom design"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2 lg:sticky lg:top-6 lg:self-start">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Preview
        </p>
        <div
          className="relative overflow-hidden rounded-2xl border border-border shadow-sm"
          style={{ ...previewStyle, minHeight: 360 }}
        >
          {overlay ? (
            <div className="pointer-events-none absolute inset-0" style={overlay} />
          ) : null}
          <div className="relative z-10 flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div
              className="size-16 rounded-full"
              style={{
                backgroundColor: config.colors?.primary ?? "#818cf8",
              }}
            />
            <p
              className="text-lg font-semibold"
              style={{ color: config.colors?.text }}
            >
              Your name
            </p>
            <p
              className="text-sm"
              style={{ color: config.colors?.textMuted }}
            >
              Bio preview line
            </p>
            <div
              className="mt-2 w-full max-w-[200px] px-4 py-3 text-sm font-medium"
              style={{
                backgroundColor:
                  config.buttons?.style === "outlined" ||
                  config.buttons?.style === "ghost"
                    ? "transparent"
                    : config.buttons?.backgroundColor,
                color: config.buttons?.textColor,
                border:
                  config.buttons?.style === "outlined"
                    ? `2px solid ${config.buttons?.borderColor ?? config.buttons?.backgroundColor}`
                    : undefined,
                borderRadius:
                  config.buttons?.radius === "full"
                    ? "9999px"
                    : config.buttons?.radius === "none"
                      ? "0"
                      : "12px",
              }}
            >
              Example link
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
