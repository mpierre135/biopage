import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const visibilityEnum = pgEnum("visibility", [
  "public",
  "unlisted",
  "private",
]);

export const blockTypeEnum = pgEnum("block_type", [
  "LINK",
  "HEADER",
  "TEXT",
  "IMAGE",
  "VIDEO",
  "YOUTUBE",
  "VIMEO",
  "SPOTIFY",
  "APPLE_MUSIC",
  "SOUNDCLOUD",
  "SOCIAL",
  "EMAIL_CAPTURE",
  "SMS_CAPTURE",
  "FORM",
  "CONTACT",
  "PRODUCT",
  "DIGITAL_PRODUCT",
  "COURSE",
  "BOOKING",
  "DONATION",
  "GALLERY",
  "CAROUSEL",
  "MAP",
  "COUNTDOWN",
  "FAQ",
  "TESTIMONIAL",
  "DIVIDER",
  "CUSTOM_EMBED",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
  "unpaid",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "refunded",
  "failed",
]);

export const reportCategoryEnum = pgEnum("report_category", [
  "spam",
  "impersonation",
  "fraud",
  "phishing",
  "prohibited_content",
  "ip_issue",
  "other",
]);

export const memberRoleEnum = pgEnum("member_role", [
  "owner",
  "admin",
  "editor",
  "analyst",
  "billing",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull(),
    firstName: varchar("first_name", { length: 120 }),
    lastName: varchar("last_name", { length: 120 }),
    imageUrl: text("image_url"),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    accountType: varchar("account_type", { length: 64 }),
    primaryObjective: varchar("primary_objective", { length: 64 }),
    isAdmin: boolean("is_admin").default(false).notNull(),
    isSuspended: boolean("is_suspended").default(false).notNull(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

export const reservedUsernames = pgTable("reserved_usernames", {
  username: varchar("username", { length: 64 }).primaryKey(),
  reason: varchar("reason", { length: 255 }),
});

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    username: varchar("username", { length: 64 }).notNull(),
    displayName: varchar("display_name", { length: 120 }),
    bio: text("bio"),
    profileImage: text("profile_image"),
    heroImage: text("hero_image"),
    profileVideo: text("profile_video"),
    location: varchar("location", { length: 160 }),
    verifiedStatus: boolean("verified_status").default(false).notNull(),
    seoTitle: varchar("seo_title", { length: 160 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    socialSharingImage: text("social_sharing_image"),
    themeId: uuid("theme_id"),
    customDomain: varchar("custom_domain", { length: 255 }),
    visibility: visibilityEnum("visibility").default("public").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    designConfig: jsonb("design_config").$type<Record<string, unknown>>().default({}),
    socialIconPosition: varchar("social_icon_position", { length: 16 }).default("bottom"),
    showBranding: boolean("show_branding").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("profiles_username_uidx").on(t.username),
    index("profiles_user_id_idx").on(t.userId),
  ],
);

export const profileMembers = pgTable(
  "profile_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRoleEnum("role").default("editor").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("profile_members_uidx").on(t.profileId, t.userId),
  ],
);

export const themes = pgTable("themes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  category: varchar("category", { length: 64 }).notNull(),
  previewImage: text("preview_image"),
  isPremium: boolean("is_premium").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const blocks = pgTable(
  "blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: blockTypeEnum("type").notNull(),
    position: integer("position").notNull().default(0),
    enabled: boolean("enabled").default(true).notNull(),
    config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    expireAt: timestamp("expire_at", { withTimezone: true }),
    timezone: varchar("timezone", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("blocks_profile_position_idx").on(t.profileId, t.position),
  ],
);

export const socialLinks = pgTable(
  "social_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 64 }).notNull(),
    url: text("url").notNull(),
    position: integer("position").notNull().default(0),
    enabled: boolean("enabled").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("social_links_profile_idx").on(t.profileId)],
);

export const linkRoutingRules = pgTable(
  "link_routing_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    blockId: uuid("block_id")
      .notNull()
      .references(() => blocks.id, { onDelete: "cascade" }),
    ruleType: varchar("rule_type", { length: 32 }).notNull(),
    conditions: jsonb("conditions").$type<Record<string, unknown>>().notNull(),
    destinationUrl: text("destination_url").notNull(),
    weight: integer("weight").default(100),
    priority: integer("priority").default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("routing_rules_block_idx").on(t.blockId)],
);

export const domains = pgTable("domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  hostname: varchar("hostname", { length: 255 }).notNull().unique(),
  verified: boolean("verified").default(false).notNull(),
  verificationToken: varchar("verification_token", { length: 255 }),
  sslStatus: varchar("ssl_status", { length: 32 }).default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
