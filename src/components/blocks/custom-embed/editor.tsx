"use client";

import { BlockEditorProps } from "@/lib/blocks/types";
import { CustomEmbedConfig } from "./index";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeEmbed } from "./sanitize";
import { AlertCircle, CheckCircle } from "lucide-react";

export function CustomEmbedEditor({
  config,
  onChange,
}: BlockEditorProps<CustomEmbedConfig>) {
  const isValid = Boolean(sanitizeEmbed(config.html ?? ""));

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="embed-html">Embed code</Label>
        <Textarea
          id="embed-html"
          value={config.html ?? ""}
          onChange={(e) => onChange({ ...config, html: e.target.value })}
          placeholder={`<iframe src="https://www.youtube.com/embed/..." title="..." allowfullscreen></iframe>`}
          rows={5}
          className="resize-none font-mono text-xs"
        />
      </div>

      {config.html ? (
        <div
          className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
            isValid
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
          }`}
        >
          {isValid ? (
            <>
              <CheckCircle className="size-3.5 mt-0.5 shrink-0" />
              Embed looks good — from an approved source.
            </>
          ) : (
            <>
              <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
              Only &lt;iframe&gt; embeds from YouTube, Vimeo, Spotify, and
              other approved sources are allowed.
            </>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Paste an &lt;iframe&gt; embed code from YouTube, Vimeo, Spotify, SoundCloud,
          Google Maps, or other approved platforms.
        </p>
      )}
    </div>
  );
}
