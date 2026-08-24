import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CreditCard, CheckCircle, Zap } from "lucide-react";
import { db } from "@/lib/db";
import { profiles, subscriptions } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { getUserPlan } from "@/lib/billing/entitlements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingActions } from "./billing-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const user = await getCurrentDbUser();
  const params = await searchParams;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) redirect("/onboarding");

  const plan = await getUserPlan(user.id);

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and billing details.
        </p>
      </div>

      {params.success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Subscription updated successfully.
        </div>
      )}
      {params.canceled && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Checkout was canceled. No changes were made.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50">
              <Zap className="size-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{plan.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {sub?.status ?? "free"}
                </Badge>
                {sub?.billingInterval && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {sub.billingInterval}
                  </span>
                )}
              </div>
            </div>
          </div>

          {sub?.currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              {sub.cancelAtPeriodEnd ? "Expires" : "Renews"} on{" "}
              {sub.currentPeriodEnd.toLocaleDateString()}
            </p>
          )}

          {plan.slug === "free" && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
              <p className="text-sm font-medium text-foreground">
                Upgrade to unlock premium features
              </p>
              <ul className="mt-2 space-y-1.5">
                {[
                  "Remove BioHub branding",
                  "Advanced analytics",
                  "Custom domains",
                  "Digital products & commerce",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <BillingActions planSlug={plan.slug} hasSubscription={false} />
            </div>
          )}

          {plan.slug !== "free" && (
            <BillingActions planSlug={plan.slug} hasSubscription={!!sub} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
