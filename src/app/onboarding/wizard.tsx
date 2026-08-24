"use client";

import { useCallback, useState, useTransition } from "react";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProfile } from "@/lib/actions/profile";
import { brandConfig } from "@/lib/brand";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES = [
  "creator",
  "influencer",
  "photographer",
  "musician",
  "coach",
  "freelancer",
  "business",
  "other",
] as const;

export function OnboardingWizard({ userId }: { userId: string }) {
  void userId;
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<string>("creator");
  const [availability, setAvailability] = useState<{
    available: boolean;
    reason: string | null;
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) {
      setAvailability(null);
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(
        `/api/v1/public/username-check?u=${encodeURIComponent(value)}`,
      );
      const data = (await res.json()) as {
        available: boolean;
        reason: string | null;
      };
      setAvailability(data);
    } catch {
      setAvailability({ available: false, reason: "Could not check username" });
    } finally {
      setChecking(false);
    }
  }, []);

  function onUsernameChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setUsername(cleaned);
    setAvailability(null);
    void checkUsername(cleaned);
  }

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set("username", username);
    fd.set("displayName", displayName || username);
    fd.set("accountType", accountType);
    startTransition(async () => {
      const result = await createProfile(fd);
      if (result && !result.success) {
        setError(result.error ?? "Something went wrong");
      }
    });
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Welcome to {brandConfig.name}
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            {step === 0 && "Claim your link"}
            {step === 1 && "What best describes you?"}
            {step === 2 && "Almost there"}
          </h1>
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
              <span className="text-sm text-muted-foreground">
                {brandConfig.domain}/
              </span>
              <Input
                id="username"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                className="min-h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
                placeholder="janedoe"
                autoComplete="off"
                autoFocus
              />
              {checking && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
              {!checking && availability?.available && (
                <Check className="size-4 text-green-600" aria-label="Available" />
              )}
            </div>
            {availability && !availability.available && (
              <p className="text-sm text-destructive" role="alert">
                {availability.reason}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="min-h-11"
              placeholder="Jane Doe"
            />
          </div>
          <Button
            className="min-h-11 w-full cursor-pointer"
            disabled={!availability?.available || pending}
            onClick={() => setStep(1)}
          >
            Continue
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <ul className="grid grid-cols-2 gap-2">
            {ACCOUNT_TYPES.map((type) => (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={cn(
                    "flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-medium capitalize transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    accountType === type
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {type}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="min-h-11 flex-1 cursor-pointer"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
            <Button
              className="min-h-11 flex-1 cursor-pointer"
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your page will be live at{" "}
            <span className="font-medium text-foreground">
              {brandConfig.domain}/{username}
            </span>
            . You can customize links and design next.
          </p>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="min-h-11 flex-1 cursor-pointer"
              onClick={() => setStep(1)}
              disabled={pending}
            >
              Back
            </Button>
            <Button
              className="min-h-11 flex-1 cursor-pointer"
              onClick={submit}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <>
                  Publish
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
