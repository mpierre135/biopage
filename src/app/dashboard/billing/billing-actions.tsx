"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  createBillingPortalSession,
  createCheckoutSession,
} from "@/lib/actions/billing";

export function BillingActions({
  planSlug,
  hasSubscription,
}: {
  planSlug: string;
  hasSubscription: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function upgrade(target: string, interval: "monthly" | "annual") {
    startTransition(async () => {
      const result = await createCheckoutSession(target, interval);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error ?? "Could not start checkout");
      }
    });
  }

  function openPortal() {
    startTransition(async () => {
      const result = await createBillingPortalSession();
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error ?? "Could not open billing portal");
      }
    });
  }

  if (hasSubscription) {
    return (
      <Button
        className="mt-4 min-h-11 cursor-pointer gap-2"
        onClick={openPortal}
        disabled={pending}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage billing"}
      </Button>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {(["creator", "pro", "business"] as const)
        .filter((slug) => slug !== planSlug)
        .slice(0, 2)
        .map((slug) => (
          <Button
            key={slug}
            className="min-h-11 cursor-pointer capitalize"
            onClick={() => upgrade(slug, "monthly")}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Upgrade to ${slug}`
            )}
          </Button>
        ))}
      <Button
        variant="outline"
        className="min-h-11 cursor-pointer"
        onClick={() => router.push("/pricing")}
      >
        Compare plans
      </Button>
    </div>
  );
}
