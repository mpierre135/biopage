"use client";

import { useState } from "react";
import { BlockRenderProps } from "@/lib/blocks/types";
import { SmsCaptureConfig } from "./index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

export function SmsCaptureRender({
  config,
  blockId,
  profileUsername,
}: BlockRenderProps<SmsCaptureConfig>) {
  const {
    headline,
    buttonText = "Text Me",
    successMessage = "Thanks! You'll hear from us soon.",
  } = config;

  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/public/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sms",
          blockId,
          profileUsername,
          phone,
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-8 text-center">
        <CheckCircle className="size-8 text-green-500" />
        <p className="font-medium text-card-foreground">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-6 space-y-4">
      {headline && (
        <h3 className="font-semibold text-card-foreground text-center">{headline}</h3>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor={`ph-${blockId}`}>Phone number</Label>
          <Input
            id={`ph-${blockId}`}
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Submitting…" : buttonText}
        </Button>
      </form>
    </div>
  );
}
