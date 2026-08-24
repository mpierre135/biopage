"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { brandConfig } from "@/lib/brand";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Get Started",
    ctaHref: "/sign-up",
    popular: false,
    features: [
      { text: "1 bio page", included: true },
      { text: "5 links", included: true },
      { text: "Basic analytics", included: true },
      { text: "Standard themes", included: true },
      { text: "BioHub branding", included: true },
      { text: "Custom domain", included: false },
      { text: "Email capture", included: false },
      { text: "Commerce tools", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Creator",
    description: "For serious content creators",
    monthlyPrice: 9,
    yearlyPrice: 7,
    cta: "Start Free Trial",
    ctaHref: "/sign-up?plan=creator",
    popular: false,
    features: [
      { text: "3 bio pages", included: true },
      { text: "Unlimited links", included: true },
      { text: "Advanced analytics", included: true },
      { text: "All themes", included: true },
      { text: "No BioHub branding", included: true },
      { text: "1 custom domain", included: true },
      { text: "Email capture (500/mo)", included: true },
      { text: "Commerce tools", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    description: "Unlock your full potential",
    monthlyPrice: 19,
    yearlyPrice: 15,
    cta: "Start Free Trial",
    ctaHref: "/sign-up?plan=pro",
    popular: true,
    features: [
      { text: "10 bio pages", included: true },
      { text: "Unlimited links", included: true },
      { text: "Advanced analytics + exports", included: true },
      { text: "All themes + custom CSS", included: true },
      { text: "No BioHub branding", included: true },
      { text: "3 custom domains", included: true },
      { text: "Email capture (5,000/mo)", included: true },
      { text: "Commerce tools", included: true },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Business",
    description: "For teams and enterprises",
    monthlyPrice: 49,
    yearlyPrice: 39,
    cta: "Start Free Trial",
    ctaHref: "/sign-up?plan=business",
    popular: false,
    features: [
      { text: "Unlimited bio pages", included: true },
      { text: "Unlimited links", included: true },
      { text: "Advanced analytics + API", included: true },
      { text: "All themes + custom CSS", included: true },
      { text: "White-label branding", included: true },
      { text: "Unlimited custom domains", included: true },
      { text: "Unlimited email capture", included: true },
      { text: "Commerce + subscriptions", included: true },
      { text: "Priority support + SLA", included: true },
    ],
  },
] as const;

function PriceDisplay({
  plan,
  annual,
}: {
  plan: (typeof plans)[number];
  annual: boolean;
}) {
  const price = annual ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-slate-900">${price}</span>
        {price > 0 && (
          <span className="text-sm text-slate-600">/month</span>
        )}
      </div>
      {annual && plan.monthlyPrice > 0 && (
        <p className="mt-1 text-sm text-indigo-600 font-medium">
          Save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year
        </p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Start free, upgrade when you&apos;re ready. All plans include a
              14-day free trial.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <label
                htmlFor="billing-toggle"
                className="text-sm font-medium text-slate-600 cursor-pointer"
              >
                Monthly
              </label>
              <Switch
                id="billing-toggle"
                checked={annual}
                onCheckedChange={setAnnual}
                aria-label="Toggle annual billing"
                className="cursor-pointer"
              />
              <label
                htmlFor="billing-toggle"
                className="text-sm font-medium text-slate-600 cursor-pointer"
              >
                Annual
              </label>
              {annual && (
                <Badge variant="secondary" className="text-indigo-700 bg-indigo-50">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-20 sm:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl border p-6 transition-all duration-200 ${
                  plan.popular
                    ? "border-indigo-300 shadow-lg shadow-indigo-100 ring-1 ring-indigo-300"
                    : "border-gray-200 hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 px-3 py-0.5">
                    Most Popular
                  </Badge>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {plan.description}
                  </p>
                </div>

                <PriceDisplay plan={plan} annual={annual} />

                <Button
                  render={<Link href={plan.ctaHref} />}
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  className="mt-6 w-full cursor-pointer"
                >
                  {plan.cta}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>

                <ul className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                      ) : (
                        <Minus className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-slate-700"
                            : "text-slate-400"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <HelpCircle className="h-4 w-4" />
              <p className="text-sm">
                Need a custom plan?{" "}
                <a
                  href={`mailto:${brandConfig.supportEmail}`}
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
                >
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
