"use client";

import { useState } from "react";
import { BlockRenderProps } from "@/lib/blocks/types";
import { FormConfig } from "./index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";

export function FormRender({
  config,
  blockId,
  profileUsername,
}: BlockRenderProps<FormConfig>) {
  const fields = config.fields ?? [];
  const submitLabel = config.submitLabel ?? "Submit";
  const successMessage =
    config.successMessage ?? "Thanks! We got your response.";

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (fields.length === 0) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/public/form-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileUsername,
          blockId,
          values,
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
    <div className="space-y-4 rounded-xl border border-border bg-card px-5 py-6">
      {config.headline && (
        <h3 className="text-center font-semibold text-card-foreground">
          {config.headline}
        </h3>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field) => {
          const id = `${blockId}-${field.id}`;
          const value = values[field.id] ?? "";
          const setValue = (next: string) =>
            setValues((prev) => ({ ...prev, [field.id]: next }));

          return (
            <div key={field.id} className="space-y-1">
              <Label htmlFor={id}>
                {field.label}
                {field.required ? " *" : ""}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={id}
                  required={field.required}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="min-h-24"
                />
              ) : field.type === "select" ? (
                <select
                  id={id}
                  required={field.required}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="border-input bg-background min-h-11 w-full cursor-pointer rounded-md border px-3 text-sm"
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={id}
                  type={field.type}
                  required={field.required}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="min-h-11"
                />
              )}
            </div>
          );
        })}
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          type="submit"
          className="min-h-11 w-full cursor-pointer"
          disabled={submitting}
        >
          {submitting ? "Submitting…" : submitLabel}
        </Button>
      </form>
    </div>
  );
}
