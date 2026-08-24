import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../src/lib/db/schema";
import { THEME_PRESETS } from "../src/lib/themes/presets";
import { RESERVED_USERNAMES } from "../src/lib/security/usernames";

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  schema,
  ws,
});

async function seedPlans() {
  console.log("Seeding plans...");

  const planData = [
    { name: "Free", slug: "free", description: "Perfect for getting started", monthlyPrice: "0", annualPrice: "0", sortOrder: 0 },
    { name: "Creator", slug: "creator", description: "For serious content creators", monthlyPrice: "9", annualPrice: "84", sortOrder: 1, stripeMonthlyPriceId: "price_1U82inGXGD1VxBNCeLGa9QHl", stripeAnnualPriceId: "price_1U82ioGXGD1VxBNCP2rIiJJe" },
    { name: "Pro", slug: "pro", description: "Unlock your full potential", monthlyPrice: "19", annualPrice: "180", sortOrder: 2, stripeMonthlyPriceId: "price_1U82ipGXGD1VxBNC4GCZOgoJ", stripeAnnualPriceId: "price_1U82ipGXGD1VxBNCUyeo2ckM" },
    { name: "Business", slug: "business", description: "For teams and enterprises", monthlyPrice: "49", annualPrice: "468", sortOrder: 3, stripeMonthlyPriceId: "price_1U82irGXGD1VxBNCeNhtejTS", stripeAnnualPriceId: "price_1U82irGXGD1VxBNC7F42Lpvk" },
  ];

  for (const plan of planData) {
    await db
      .insert(schema.plans)
      .values(plan)
      .onConflictDoUpdate({
        target: schema.plans.slug,
        set: {
          name: plan.name,
          description: plan.description,
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          sortOrder: plan.sortOrder,
          ...("stripeMonthlyPriceId" in plan ? { stripeMonthlyPriceId: plan.stripeMonthlyPriceId } : {}),
          ...("stripeAnnualPriceId" in plan ? { stripeAnnualPriceId: plan.stripeAnnualPriceId } : {}),
        },
      });
  }

  console.log(`  ${planData.length} plans seeded.`);
}

async function seedFeatures() {
  console.log("Seeding features...");

  const featureData = [
    { key: "removeBranding", name: "Remove Branding", description: "Hide BioHub badge from your page" },
    { key: "advancedAnalytics", name: "Advanced Analytics", description: "Detailed traffic reports and exports" },
    { key: "customThemes", name: "Custom Themes", description: "Access to premium themes and custom CSS" },
    { key: "scheduledLinks", name: "Scheduled Links", description: "Set publish/expire dates for links" },
    { key: "leadCapture", name: "Lead Capture", description: "Email and SMS capture forms" },
    { key: "customDomain", name: "Custom Domain", description: "Use your own domain" },
    { key: "digitalProducts", name: "Digital Products", description: "Sell downloadable files" },
    { key: "integrations", name: "Integrations", description: "Connect to third-party tools" },
    { key: "pixels", name: "Tracking Pixels", description: "Add Facebook, Google, TikTok pixels" },
    { key: "advancedRouting", name: "Advanced Routing", description: "Geo and device-based link routing" },
    { key: "abTesting", name: "A/B Testing", description: "Test different page layouts" },
    { key: "multipleProfiles", name: "Multiple Profiles", description: "Manage several bio pages" },
    { key: "teams", name: "Team Collaboration", description: "Invite team members with roles" },
    { key: "csvExport", name: "CSV Export", description: "Export audience contacts" },
    { key: "qrCustomization", name: "QR Customization", description: "Custom QR colors and branding" },
  ];

  for (const feat of featureData) {
    await db
      .insert(schema.features)
      .values(feat)
      .onConflictDoUpdate({
        target: schema.features.key,
        set: { name: feat.name, description: feat.description },
      });
  }

  console.log(`  ${featureData.length} features seeded.`);
}

async function seedPlanFeatures() {
  console.log("Seeding plan features...");

  const allPlans = await db.select().from(schema.plans);
  const allFeatures = await db.select().from(schema.features);

  const planMap = new Map(allPlans.map((p) => [p.slug, p.id]));
  const featMap = new Map(allFeatures.map((f) => [f.key, f.id]));

  const matrix: Record<string, string[]> = {
    free: ["leadCapture"],
    creator: ["removeBranding", "advancedAnalytics", "customThemes", "scheduledLinks", "leadCapture", "customDomain", "qrCustomization"],
    pro: ["removeBranding", "advancedAnalytics", "customThemes", "scheduledLinks", "leadCapture", "customDomain", "digitalProducts", "integrations", "pixels", "multipleProfiles", "csvExport", "qrCustomization"],
    business: ["removeBranding", "advancedAnalytics", "customThemes", "scheduledLinks", "leadCapture", "customDomain", "digitalProducts", "integrations", "pixels", "advancedRouting", "abTesting", "multipleProfiles", "teams", "csvExport", "qrCustomization"],
  };

  let count = 0;
  for (const [planSlug, featureKeys] of Object.entries(matrix)) {
    const planId = planMap.get(planSlug);
    if (!planId) continue;

    for (const key of featureKeys) {
      const featureId = featMap.get(key);
      if (!featureId) continue;

      await db
        .insert(schema.planFeatures)
        .values({ planId, featureId })
        .onConflictDoNothing();
      count++;
    }
  }

  console.log(`  ${count} plan-feature links seeded.`);
}

async function seedReservedUsernames() {
  console.log("Seeding reserved usernames...");

  const usernames = Array.from(RESERVED_USERNAMES);
  let count = 0;

  for (const username of usernames) {
    await db
      .insert(schema.reservedUsernames)
      .values({ username, reason: "System reserved" })
      .onConflictDoNothing();
    count++;
  }

  console.log(`  ${count} reserved usernames seeded.`);
}

async function seedThemes() {
  console.log("Seeding themes...");

  for (const preset of THEME_PRESETS) {
    await db
      .insert(schema.themes)
      .values({
        name: preset.name,
        slug: preset.slug,
        category: preset.category,
        isPremium: preset.isPremium,
        config: preset.config as Record<string, unknown>,
      })
      .onConflictDoUpdate({
        target: schema.themes.slug,
        set: {
          name: preset.name,
          category: preset.category,
          isPremium: preset.isPremium,
          config: preset.config as Record<string, unknown>,
        },
      });
  }

  console.log(`  ${THEME_PRESETS.length} themes seeded.`);
}

async function main() {
  console.log("Starting seed...\n");

  await seedPlans();
  await seedFeatures();
  await seedPlanFeatures();
  await seedReservedUsernames();
  await seedThemes();

  console.log("\nSeed completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
