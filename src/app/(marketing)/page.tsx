import Link from "next/link";
import {
  Link as LinkIcon,
  BarChart3,
  Palette,
  Mail,
  ShoppingBag,
  Globe,
  Smartphone,
  Shield,
  ArrowRight,
  Users,
  TrendingUp,
  Zap,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { brandConfig } from "@/lib/brand";

const features = [
  {
    icon: LinkIcon,
    title: "Smart Link-in-Bio",
    description:
      "One customizable page with unlimited links, embeds, and rich media blocks.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track clicks, views, and audience geography with a beautiful dashboard.",
  },
  {
    icon: Palette,
    title: "Custom Themes",
    description:
      "Choose from dozens of premium themes or design your own with full CSS control.",
  },
  {
    icon: Mail,
    title: "Email & SMS Capture",
    description:
      "Built-in lead forms that sync with your favorite email marketing tools.",
  },
  {
    icon: ShoppingBag,
    title: "Commerce Ready",
    description:
      "Sell digital products, accept tips, and showcase your merch store.",
  },
  {
    icon: Globe,
    title: "Custom Domains",
    description:
      "Use your own domain for a fully branded experience your audience trusts.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description:
      "Pixel-perfect on every device. Fast loading, accessible, and SEO-optimized.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 compliant with 2FA, team roles, and audit logs for peace of mind.",
  },
] as const;

const stats = [
  { value: "10K+", label: "Creators" },
  { value: "2.4M", label: "Links Clicked" },
  { value: "99.9%", label: "Uptime" },
  { value: "150+", label: "Countries" },
] as const;

const steps = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Sign up in seconds. No credit card required. Pick your unique username.",
  },
  {
    step: "02",
    title: "Customize your page",
    description:
      "Add your links, choose a theme, upload media, and make it yours.",
  },
  {
    step: "03",
    title: "Share everywhere",
    description:
      "Drop your link in bios, emails, and posts. Watch your audience grow.",
  },
] as const;

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Zap className="h-3.5 w-3.5" />
            Now with AI-powered link optimization
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {brandConfig.tagline.split(".")[0]}.
            <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {brandConfig.tagline.split(".").slice(1).join(".").trim()}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            {brandConfig.description} Grow your audience, capture leads, and
            sell products — all from a single, beautiful page.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              render={<Link href="/sign-up" />}
              size="lg"
              className="h-12 min-w-[200px] cursor-pointer text-base"
            >
              Get Started Free
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              render={<Link href="/features" />}
              variant="outline"
              size="lg"
              className="h-12 min-w-[200px] cursor-pointer text-base"
            >
              See it in action
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Free forever. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="border-y border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-slate-500">
          Trusted by 10,000+ creators worldwide
        </p>
        <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-slate-900 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to grow
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A complete toolkit for creators who want more than just a link tree.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors duration-200 group-hover:bg-indigo-100">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Three simple steps to launch your creator hub.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white">
                {item.step}
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-8 sm:p-12 lg:p-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <CheckCircle
                  key={i}
                  className="h-5 w-5 text-indigo-500"
                />
              ))}
            </div>
            <blockquote className="mt-6 text-xl font-medium text-slate-900 sm:text-2xl">
              &ldquo;{brandConfig.name} replaced three tools for me. My bio
              page, analytics, and email capture — all in one place.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">
                  Sarah Chen
                </p>
                <p className="text-sm text-slate-600">
                  Content Creator, 240K followers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 sm:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <TrendingUp className="mx-auto h-10 w-10 text-indigo-400" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to grow your audience?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Join thousands of creators who use {brandConfig.name} to connect
            with their audience and grow their business.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              render={<Link href="/sign-up" />}
              size="lg"
              className="h-12 min-w-[200px] cursor-pointer text-base"
            >
              Get Started Free
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              render={<Link href="/pricing" />}
              variant="outline"
              size="lg"
              className="h-12 min-w-[200px] cursor-pointer border-slate-600 bg-transparent text-base text-white hover:bg-slate-800"
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <CTASection />
    </>
  );
}
