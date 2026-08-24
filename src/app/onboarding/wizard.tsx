"use client";

import { useState, useTransition, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  User,
  Briefcase,
  Palette,
  Music,
  Star,
  MoreHorizontal,
  Users,
  ShoppingBag,
  Share2,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "./actions";
import { checkUsernameAvailability } from "@/lib/actions/profile";

type AccountType = "creator" | "business" | "artist" | "musician" | "influencer" | "other";
type Objective = "grow_audience" | "sell_products" | "share_content" | "networking";

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: typeof User }[] = [
  { value: "creator", label: "Creator", icon: User },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "artist", label: "Artist", icon: Palette },
  { value: "musician", label: "Musician", icon: Music },
  { value: "influencer", label: "Influencer", icon: Star },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

const OBJECTIVES: { value: Objective; label: string; description: string; icon: typeof Users }[] = [
  {
    value: "grow_audience",
    label: "Grow my audience",
    description: "Build an email list and get more followers",
    icon: Users,
  },
  {
    value: "sell_products",
    label: "Sell products",
    description: "Monetize with digital or physical products",
    icon: ShoppingBag,
  },
  {
    value: "share_content",
    label: "Share content",
    description: "Centralize my links, videos, and media",
    icon: Share2,
  },
  {
    value: "networking",
    label: "Networking",
    description: "Connect with others and share my info",
    icon: Handshake,
  },
];

interface WizardProps {
  userId: string;
}

export function OnboardingWizard({ userId }: WizardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);

  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [objective, setObjective] = useState<Objective | null>(null);
  const [error, setError] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const checkUsername = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 3) {
      setUsernameStatus({ checking: false });
      return;
    }

    setUsernameStatus({ checking: true });

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability(value);
        setUsernameStatus({
          checking: false,
          available: result.available,
          reason: result.reason,
        });
      } catch {
        setUsernameStatus({ checking: false });
      }
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleUsernameChange(value: string) {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setUsername(sanitized);
    checkUsername(sanitized);
  }

  const canAdvance = [
    username.length >= 3 && usernameStatus.available === true,
    accountType !== null,
    objective !== null,
    true,
  ][step];

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  function handleComplete() {
    setError("");
    startTransition(async () => {
      const result = await completeOnboarding({
        userId,
        username,
        accountType: accountType!,
        objective: objective!,
      });

      if (!result.success) {
        setError(typeof result.error === "string" ? result.error : "Something went wrong.");
        return;
      }

      router.push("/dashboard");
    });
  }

  return (
    <div className="w-full max-w-lg">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of 4</span>
          <span>{Math.round(((step + 1) / 4) * 100)}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {/* Step 0: Username */}
        {step === 0 && (
          <div>
            <div className="mb-6">
              <span className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </span>
              <h2 className="mt-3 text-xl font-semibold">Claim your username</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This becomes your public URL. You can change it later.
              </p>
            </div>
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">biohub.com/</span>
              <Input
                id="username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleUsernameChange(e.target.value)
                }
                placeholder="yourname"
                maxLength={30}
                autoFocus
                className="flex-1"
              />
            </div>
            <div className="mt-2 h-5 text-sm">
              {usernameStatus.checking && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" /> Checking…
                </span>
              )}
              {!usernameStatus.checking && usernameStatus.available === true && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="size-3" /> Available!
                </span>
              )}
              {!usernameStatus.checking &&
                usernameStatus.available === false &&
                usernameStatus.reason && (
                  <span className="text-destructive">{usernameStatus.reason}</span>
                )}
            </div>
          </div>
        )}

        {/* Step 1: Account type */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold">What describes you best?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll personalize your experience based on this.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {ACCOUNT_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAccountType(value)}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all duration-200",
                    accountType === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/50",
                  )}
                >
                  <Icon className="size-6" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Objective */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold">What&apos;s your main goal?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;ll suggest the best blocks and features for you.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {OBJECTIVES.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setObjective(value)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
                    objective === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40 hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      objective === value
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold">You&apos;re all set!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your choices and publish your page.
            </p>
            <dl className="mt-6 divide-y divide-border text-sm">
              <div className="flex items-center justify-between py-3">
                <dt className="text-muted-foreground">Username</dt>
                <dd className="font-medium">biohub.com/{username}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-muted-foreground">Account type</dt>
                <dd className="font-medium capitalize">{accountType}</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-muted-foreground">Primary goal</dt>
                <dd className="font-medium">
                  {OBJECTIVES.find((o) => o.value === objective)?.label}
                </dd>
              </div>
            </dl>
            {error && (
              <p className="mt-4 text-sm text-destructive">{error}</p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isPending}
              className="min-h-10 cursor-pointer gap-1.5"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canAdvance}
              className="min-h-10 cursor-pointer gap-1.5"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isPending}
              className="min-h-10 cursor-pointer gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  Publish my page
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
