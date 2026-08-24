import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../src/lib/db/schema";
import { THEME_PRESETS } from "../src/lib/themes/presets";
import { RESERVED_USERNAMES } from "../src/lib/security/usernames";
import { FEATURE_KEYS } from "../src/lib/billing/features";

const db = drizzle({ connection: process.env.DATABASE_URL!, schema, ws });

type PlanRow = typeof schema.plans.$inferSelect;
type FeatureRow = typeof schema.features.$inferSelect;

const PLAN_FEATURE_MAP: Record<string, string[]> = {
  free: ["leadCapture"],
  creator: [
    "removeBranding",
    "advancedAnalytics",
    "customThemes",
    "scheduledLinks",
    "leadCapture",
  ],
  pro: [
    "removeBranding",
    "advancedAnalytics",
    "customThemes",
    "scheduledLinks",
    "leadCapture",
    "customDomain",
    "digitalProducts",
    "integrations",
    "csvExport",
    "qrCustomization",
  ],
  business: [
    "removeBranding",
    "advancedAnalytics",
    "customThemes",
    "scheduledLinks",
    "leadCapture",
    "customDomain",
    "digitalProducts",
    "integrations",
    "csvExport",
    "qrCustomization",
    "pixels",
    "advancedRouting",
    "abTesting",
    "multipleProfiles",
    "teams",
  ],
};

async function seed() {
  console.log("🌱 Seeding database…\n");

  // ── 1. Plans ─────────────────────────────────────────────────────────
  console.log("  Plans…");
  const planRows = await db
    .insert(schema.plans)
    .values([
      {
        name: "Free",
        slug: "free",
        description: "Get started for free",
        monthlyPrice: "0",
        annualPrice: "0",
        sortOrder: 0,
      },
      {
        name: "Creator",
        slug: "creator",
        description: "For growing creators",
        monthlyPrice: "9",
        annualPrice: "86.40",
        sortOrder: 1,
      },
      {
        name: "Pro",
        slug: "pro",
        description: "For serious creators",
        monthlyPrice: "19",
        annualPrice: "182.40",
        sortOrder: 2,
      },
      {
        name: "Business",
        slug: "business",
        description: "For teams and businesses",
        monthlyPrice: "49",
        annualPrice: "470.40",
        sortOrder: 3,
      },
    ])
    .onConflictDoNothing()
    .returning();

  const plansBySlug = Object.fromEntries(
    planRows.map((p: PlanRow) => [p.slug, p]),
  );
  console.log(`    ✓ ${planRows.length} plans`);

  // ── 2. Features ──────────────────────────────────────────────────────
  console.log("  Features…");
  const featureRows = await db
    .insert(schema.features)
    .values(
      FEATURE_KEYS.map((key) => ({
        key,
        name: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase()),
        description: `${key} feature`,
      })),
    )
    .onConflictDoNothing()
    .returning();

  const featuresByKey = Object.fromEntries(
    featureRows.map((f: FeatureRow) => [f.key, f]),
  );
  console.log(`    ✓ ${featureRows.length} features`);

  // ── 3. Plan ↔ Feature mapping ────────────────────────────────────────
  console.log("  Plan features…");
  const planFeatureValues: {
    planId: string;
    featureId: string;
    limitValue: null;
  }[] = [];

  for (const [slug, keys] of Object.entries(PLAN_FEATURE_MAP)) {
    const plan = plansBySlug[slug];
    if (!plan) continue;

    for (const key of keys) {
      const feature = featuresByKey[key];
      if (!feature) continue;
      planFeatureValues.push({
        planId: plan.id,
        featureId: feature.id,
        limitValue: null,
      });
    }
  }

  if (planFeatureValues.length > 0) {
    await db
      .insert(schema.planFeatures)
      .values(planFeatureValues)
      .onConflictDoNothing();
  }
  console.log(`    ✓ ${planFeatureValues.length} plan-feature mappings`);

  // ── 4. Themes ────────────────────────────────────────────────────────
  console.log("  Themes…");
  const themeRows = await db
    .insert(schema.themes)
    .values(
      THEME_PRESETS.map((t) => ({
        name: t.name,
        slug: t.slug,
        category: t.category,
        isPremium: t.isPremium,
        config: t.config as Record<string, unknown>,
      })),
    )
    .onConflictDoNothing()
    .returning();
  console.log(`    ✓ ${themeRows.length} themes`);

  // ── 5. Reserved usernames ────────────────────────────────────────────
  console.log("  Reserved usernames…");
  const usernameValues = Array.from(RESERVED_USERNAMES).map((u) => ({
    username: u,
    reason: "system-reserved",
  }));
  await db
    .insert(schema.reservedUsernames)
    .values(usernameValues)
    .onConflictDoNothing();
  console.log(`    ✓ ${usernameValues.length} reserved usernames`);

  // ── 6. Demo profile (janedoe) ────────────────────────────────────────
  console.log("  Demo profile…");

  // Fake Clerk ID — this user is for demo/dev only and is not backed by
  // a real Clerk account. In production the user sync webhook would
  // create this row; here we insert manually so the public page works.
  const DEMO_CLERK_ID = "demo_clerk_janedoe";

  const [demoUser] = await db
    .insert(schema.users)
    .values({
      clerkId: DEMO_CLERK_ID,
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
      onboardingCompleted: true,
    })
    .onConflictDoNothing()
    .returning();

  if (demoUser) {
    const defaultTheme = themeRows.find(
      (t: (typeof themeRows)[number]) => t.slug === "clean-slate",
    );

    const [demoProfile] = await db
      .insert(schema.profiles)
      .values({
        userId: demoUser.id,
        username: "janedoe",
        displayName: "Jane Doe",
        bio: "Designer, creator & coffee enthusiast. Building cool things on the internet. ✨",
        isPublished: true,
        visibility: "public",
        themeId: defaultTheme?.id ?? null,
      })
      .onConflictDoNothing()
      .returning();

    if (demoProfile) {
      await db
        .insert(schema.blocks)
        .values([
          {
            profileId: demoProfile.id,
            type: "HEADER" as const,
            position: 0,
            enabled: true,
            config: { title: "Hey, I'm Jane 👋" },
          },
          {
            profileId: demoProfile.id,
            type: "LINK" as const,
            position: 1,
            enabled: true,
            config: {
              title: "My Portfolio",
              url: "https://example.com/portfolio",
              icon: "globe",
            },
          },
          {
            profileId: demoProfile.id,
            type: "LINK" as const,
            position: 2,
            enabled: true,
            config: {
              title: "Follow me on Twitter",
              url: "https://twitter.com/janedoe",
              icon: "twitter",
            },
          },
          {
            profileId: demoProfile.id,
            type: "LINK" as const,
            position: 3,
            enabled: true,
            config: {
              title: "Subscribe to my Newsletter",
              url: "https://example.com/newsletter",
              icon: "mail",
            },
          },
          {
            profileId: demoProfile.id,
            type: "EMAIL_CAPTURE" as const,
            position: 4,
            enabled: true,
            config: {
              heading: "Join my mailing list",
              description: "Get weekly design tips & inspiration",
              buttonText: "Subscribe",
              successMessage: "You're in! 🎉",
            },
          },
          {
            profileId: demoProfile.id,
            type: "DIVIDER" as const,
            position: 5,
            enabled: true,
            config: { style: "line" },
          },
        ])
        .onConflictDoNothing();

      console.log(
        `    ✓ Demo user + profile "janedoe" with 6 blocks`,
      );
    } else {
      console.log("    ⏭ Demo profile already exists, skipping");
    }
  } else {
    console.log("    ⏭ Demo user already exists, skipping");
  }

  console.log("\n✅ Seeding complete!");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
