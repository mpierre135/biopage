"use client";

import { useState } from "react";
import { BlockRenderProps } from "@/lib/blocks/types";
import { EmailCaptureConfig } from "./index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

export function EmailCaptureRender({
  config,
  blockId,
  profileUsername,
}: BlockRenderProps<EmailCaptureConfig>) {
  const {
    headline,
    buttonText = "Subscribe",
    collectFirstName = false,
    successMessage = "You're in! Thanks for signing up.",
  } = config;

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
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
          type: "email",
          blockId,
          profileUsername,
          email,
          firstName: collectFirstName ? firstName : undefined,
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
        {collectFirstName && (
          <div className="space-y-1">
            <Label htmlFor={`fn-${blockId}`}>First name</Label>
            <Input
              id={`fn-${blockId}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              autoComplete="given-name"
            />
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor={`em-${blockId}`}>Email address</Label>
          <Input
            id={`em-${blockId}`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
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
