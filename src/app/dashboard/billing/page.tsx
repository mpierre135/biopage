import { eq } from "drizzle-orm";
import { Check, CreditCard, Sparkles } from "lucide-react";
import { getCurrentDbUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { plans, subscriptions } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const planHighlights: Record<string, string[]> = {
  free: ["1 bio page", "Basic analytics", "Standard themes", "Community support"],
  creator: [
    "3 bio pages",
    "Advanced analytics",
    "Premium themes",
    "Custom domain",
    "Priority support",
  ],
  pro: [
    "10 bio pages",
    "Full analytics suite",
    "All themes",
    "Custom domains",
    "Remove branding",
    "API access",
  ],
  business: [
    "Unlimited pages",
    "Team collaboration",
    "White-label",
    "Dedicated support",
    "SLA",
    "Custom integrations",
  ],
};

export default async function BillingPage() {
  const user = await getCurrentDbUser();

  const allPlans = await db.select().from(plans).where(eq(plans.isActive, true));

  const [currentSub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .limit(1);

  const currentPlan = currentSub
    ? allPlans.find((p) => p.id === currentSub.planId)
    : null;

  const hasStripe = !!process.env.STRIPE_SECRET_KEY;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Current plan */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                <CreditCard className="size-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Current Plan
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {currentPlan?.name ?? "Free"}
                </p>
              </div>
            </div>
            {currentSub && (
              <Badge
                variant="secondary"
                className={
                  currentSub.status === "active"
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }
              >
                {currentSub.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan cards */}
      <div>
        <h2 className="mb-4 text-lg font-medium text-slate-900">
          Available Plans
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {allPlans.length > 0
            ? allPlans.map((plan) => {
                const isCurrent = currentPlan?.id === plan.id;
                const features = planHighlights[plan.slug] ?? [];

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      isCurrent && "ring-2 ring-indigo-500"
                    )}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        {isCurrent && (
                          <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                            Current
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-slate-900">
                        ${Number(plan.monthlyPrice)}
                        <span className="text-sm font-normal text-slate-500">
                          /mo
                        </span>
                      </p>
                      <ul className="mt-4 space-y-2">
                        {features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-2 text-sm text-slate-600"
                          >
                            <Check className="size-4 text-indigo-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {!isCurrent && (
                        <Button
                          className="mt-6 w-full cursor-pointer min-h-[44px]"
                          variant={plan.slug === "pro" ? "default" : "outline"}
                          disabled={!hasStripe}
                        >
                          {hasStripe ? "Upgrade" : "Coming soon"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            : ["Free", "Creator", "Pro", "Business"].map((name) => (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle>{name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-500">
                      Plan details coming soon.
                    </p>
                    <Button
                      className="mt-6 w-full cursor-pointer min-h-[44px]"
                      variant="outline"
                      disabled
                    >
                      Coming soon
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      {!hasStripe && (
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <Sparkles className="size-5 text-amber-500 shrink-0" />
            <p className="text-sm text-slate-600">
              Stripe is not configured. Payment processing will be available
              once the STRIPE_SECRET_KEY environment variable is set.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
