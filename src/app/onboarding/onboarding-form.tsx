"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, X, Loader2, User, Briefcase, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brandConfig } from "@/lib/brand";
import { createProfile } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";

const accountTypes = [
  { value: "creator", label: "Creator", icon: User, description: "Influencer, artist, musician" },
  { value: "professional", label: "Professional", icon: Briefcase, description: "Freelancer, consultant, coach" },
  { value: "business", label: "Business", icon: Store, description: "Brand, agency, organization" },
] as const;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function OnboardingForm({ firstName }: { firstName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(firstName);
  const [accountType, setAccountType] = useState("creator");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameError, setUsernameError] = useState("");
  const [formError, setFormError] = useState("");
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  const checkUsername = useCallback(
    (value: string) => {
      if (checkTimeout) clearTimeout(checkTimeout);

      if (value.length < 3) {
        setUsernameStatus("idle");
        setUsernameError("");
        return;
      }

      setUsernameStatus("checking");
      const timeout = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/v1/public/username-check?u=${encodeURIComponent(value)}`,
          );
          const data = await res.json();
          if (data.available) {
            setUsernameStatus("available");
            setUsernameError("");
          } else {
            setUsernameStatus("taken");
            setUsernameError(data.reason ?? "Username unavailable.");
          }
        } catch {
          setUsernameStatus("invalid");
          setUsernameError("Could not check username.");
        }
      }, 400);
      setCheckTimeout(timeout);
    },
    [checkTimeout],
  );

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setUsername(val);
    checkUsername(val);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (usernameStatus !== "available") return;

    setFormError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("username", username);
      fd.set("displayName", displayName);
      fd.set("accountType", accountType);

      const result = await createProfile(fd);
      if (!result.success) {
        setFormError(result.error ?? "Something went wrong.");
      }
    });
  }

  const usernameIcon = {
    idle: null,
    checking: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    available: <Check className="h-4 w-4 text-green-600" />,
    taken: <X className="h-4 w-4 text-red-500" />,
    invalid: <X className="h-4 w-4 text-red-500" />,
  }[usernameStatus];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl font-semibold text-foreground">
          Welcome to {brandConfig.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Claim your username and set up your page.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                biohub.com/
              </span>
              <Input
                id="username"
                value={username}
                onChange={handleUsernameChange}
                className="pl-[5.5rem] pr-9"
                placeholder="yourname"
                maxLength={30}
                autoComplete="off"
                required
              />
              {usernameIcon && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameIcon}
                </span>
              )}
            </div>
            {usernameError && (
              <p className="text-sm text-red-500">{usernameError}</p>
            )}
            {usernameStatus === "available" && (
              <p className="text-sm text-green-600">Username is available!</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label>What best describes you?</Label>
            <div className="grid grid-cols-3 gap-2">
              {accountTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setAccountType(type.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all duration-200 cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    accountType === type.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50",
                  )}
                >
                  <type.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {formError && (
            <p className="text-sm text-red-500">{formError}</p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={usernameStatus !== "available" || isPending}
            className="w-full min-h-11 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create My Page
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
