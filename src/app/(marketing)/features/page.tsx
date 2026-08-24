import Link from "next/link";
import type { Metadata } from "next";
import {
  Link as LinkIcon,
  BarChart3,
  Palette,
  Mail,
  ShoppingBag,
  QrCode,
  ArrowRight,
  Globe,
  Layers,
  MousePointerClick,
  PieChart,
  Users,
  TrendingUp,
  Smartphone,
  Lock,
  Paintbrush,
  ImageIcon,
  ScanLine,
  Download,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { brandConfig } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Features",
  description: `Explore all the tools ${brandConfig.name} gives you to grow your audience, capture leads, and monetize your content.`,
};

const categories = [
  {
    id: "links",
    label: "Links",
    icon: LinkIcon,
    headline: "Your links, supercharged",
    description:
      "Go beyond a simple list. Add rich media embeds, priority links, schedules, and smart redirects.",
    features: [
      {
        icon: Layers,
        title: "Unlimited Links",
        description:
          "Add as many links as you need. Organize them with drag-and-drop reordering.",
      },
      {
        icon: MousePointerClick,
        title: "Smart Link Thumbnails",
        description:
          "Auto-generated previews with custom thumbnails for maximum click-through.",
      },
      {
        icon: Globe,
        title: "Link Scheduling",
        description:
          "Set links to appear and disappear on a schedule. Perfect for limited-time offers.",
      },
      {
        icon: Smartphone,
        title: "Rich Embeds",
        description:
          "Embed YouTube, Spotify, TikTok, and more directly into your bio page.",
      },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    headline: "Data that drives decisions",
    description:
      "Understand your audience with real-time analytics. Track every click, view, and conversion.",
    features: [
      {
        icon: PieChart,
        title: "Click Analytics",
        description:
          "See which links get the most engagement with detailed click tracking.",
      },
      {
        icon: Users,
        title: "Audience Insights",
        description:
          "Understand where your audience comes from — geography, devices, and referrers.",
      },
      {
        icon: TrendingUp,
        title: "Growth Trends",
        description:
          "Track your bio page views over time and identify growth patterns.",
      },
      {
        icon: Download,
        title: "Export & API",
        description:
          "Export analytics data as CSV or connect via API for custom reporting.",
      },
    ],
  },
  {
    id: "leads",
    label: "Lead Capture",
    icon: Mail,
    headline: "Turn visitors into subscribers",
    description:
      "Capture emails and phone numbers with beautiful, high-converting forms built right in.",
    features: [
      {
        icon: Mail,
        title: "Email Collection",
        description:
          "Customizable opt-in forms that integrate with Mailchimp, ConvertKit, and more.",
      },
      {
        icon: Lock,
        title: "Gated Content",
        description:
          "Lock premium links behind an email gate to grow your list faster.",
      },
      {
        icon: Users,
        title: "Subscriber Management",
        description:
          "View, tag, and segment your subscribers directly from your dashboard.",
      },
      {
        icon: TrendingUp,
        title: "Conversion Tracking",
        description:
          "See opt-in rates per form and A/B test different placements.",
      },
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    icon: ShoppingBag,
    headline: "Monetize your influence",
    description:
      "Sell digital products, accept tips, and showcase merch — all without leaving your bio page.",
    features: [
      {
        icon: CreditCard,
        title: "Digital Products",
        description:
          "Sell e-books, courses, presets, and templates with instant delivery.",
      },
      {
        icon: DollarSign,
        title: "Tips & Donations",
        description:
          "Let your audience support you with one-click tip jars and custom amounts.",
      },
      {
        icon: ShoppingBag,
        title: "Merch Storefront",
        description:
          "Connect your Shopify or print-on-demand store for seamless product showcasing.",
      },
      {
        icon: PieChart,
        title: "Revenue Analytics",
        description:
          "Track sales, revenue, and conversion rates across all your products.",
      },
    ],
  },
  {
    id: "themes",
    label: "Themes",
    icon: Palette,
    headline: "Make it unmistakably you",
    description:
      "Choose from professionally designed themes or create a fully custom look with CSS.",
    features: [
      {
        icon: Paintbrush,
        title: "Premium Themes",
        description:
          "Dozens of polished themes designed for different creator types and niches.",
      },
      {
        icon: Palette,
        title: "Color & Font Customization",
        description:
          "Fine-tune every aspect — colors, fonts, spacing, and button styles.",
      },
      {
        icon: ImageIcon,
        title: "Custom Backgrounds",
        description:
          "Upload images, use gradients, or add animated backgrounds for standout pages.",
      },
      {
        icon: Globe,
        title: "Custom CSS",
        description:
          "Full CSS access for developers who want complete design control.",
      },
    ],
  },
  {
    id: "qr",
    label: "QR Codes",
    icon: QrCode,
    headline: "Bridge offline and online",
    description:
      "Generate branded QR codes that link directly to your bio page or any specific link.",
    features: [
      {
        icon: QrCode,
        title: "Branded QR Codes",
        description:
          "Custom colors, logos, and styles that match your brand identity.",
      },
      {
        icon: ScanLine,
        title: "Scan Analytics",
        description:
          "Track how many people scan your QR codes and where they do it.",
      },
      {
        icon: Download,
        title: "High-Res Downloads",
        description:
          "Download QR codes as SVG or PNG in any resolution for print and digital use.",
      },
      {
        icon: Layers,
        title: "Dynamic QR Codes",
        description:
          "Update the destination URL without reprinting — the QR code stays the same.",
      },
    ],
  },
] as const;

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              grow your audience
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            From smart links to commerce, analytics to lead capture —{" "}
            {brandConfig.name} is the all-in-one platform for creators who mean
            business.
          </p>
        </div>

        <nav className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

function FeatureCategorySection({
  category,
  index,
}: {
  category: (typeof categories)[number];
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <section
      id={category.id}
      className={`py-20 sm:py-28 ${isEven ? "bg-white" : "bg-slate-50"}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <category.icon className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {category.headline}
          </h2>
          <p className="mt-3 text-base text-slate-600">
            {category.description}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {category.features.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
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
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Create your free {brandConfig.name} page in under two minutes.
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

export default function FeaturesPage() {
  return (
    <>
      <HeroSection />
      {categories.map((category, index) => (
        <FeatureCategorySection
          key={category.id}
          category={category}
          index={index}
        />
      ))}
      <CTASection />
    </>
  );
}
