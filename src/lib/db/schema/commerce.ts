import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { orderStatusEnum, profiles, users } from "./core";

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    visitorId: varchar("visitor_id", { length: 64 }).notNull(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    blockId: uuid("block_id"),
    linkId: uuid("link_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    referrer: text("referrer"),
    utmSource: varchar("utm_source", { length: 120 }),
    utmMedium: varchar("utm_medium", { length: 120 }),
    utmCampaign: varchar("utm_campaign", { length: 120 }),
    utmTerm: varchar("utm_term", { length: 120 }),
    utmContent: varchar("utm_content", { length: 120 }),
    country: varchar("country", { length: 2 }),
    region: varchar("region", { length: 120 }),
    city: varchar("city", { length: 120 }),
    device: varchar("device", { length: 32 }),
    browser: varchar("browser", { length: 64 }),
    operatingSystem: varchar("operating_system", { length: 64 }),
    timestamp: timestamp("timestamp", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("analytics_events_profile_ts_idx").on(t.profileId, t.timestamp),
    index("analytics_events_type_idx").on(t.profileId, t.eventType),
    index("analytics_events_visitor_idx").on(t.visitorId),
    index("analytics_events_block_idx").on(t.blockId),
  ],
);

export const analyticsDaily = pgTable(
  "analytics_daily",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    views: integer("views").default(0).notNull(),
    uniqueViews: integer("unique_views").default(0).notNull(),
    clicks: integer("clicks").default(0).notNull(),
    uniqueClicks: integer("unique_clicks").default(0).notNull(),
    leads: integer("leads").default(0).notNull(),
    purchases: integer("purchases").default(0).notNull(),
    revenue: numeric("revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  },
  (t) => [
    uniqueIndex("analytics_daily_uidx").on(t.profileId, t.date),
  ],
);

export const analyticsLinkDaily = pgTable(
  "analytics_link_daily",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    blockId: uuid("block_id").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    clicks: integer("clicks").default(0).notNull(),
    uniqueClicks: integer("unique_clicks").default(0).notNull(),
  },
  (t) => [
    uniqueIndex("analytics_link_daily_uidx").on(t.profileId, t.blockId, t.date),
  ],
);

export const audienceContacts = pgTable(
  "audience_contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 32 }),
    firstName: varchar("first_name", { length: 120 }),
    lastName: varchar("last_name", { length: 120 }),
    source: varchar("source", { length: 64 }),
    campaign: varchar("campaign", { length: 120 }),
    blockId: uuid("block_id"),
    status: varchar("status", { length: 32 }).default("active").notNull(),
    unsubscribed: boolean("unsubscribed").default(false).notNull(),
    consentMetadata: jsonb("consent_metadata").$type<Record<string, unknown>>().default({}),
    customFields: jsonb("custom_fields").$type<Record<string, unknown>>().default({}),
    notes: text("notes"),
    value: numeric("value", { precision: 12, scale: 2 }).default("0"),
    utmSource: varchar("utm_source", { length: 120 }),
    utmMedium: varchar("utm_medium", { length: 120 }),
    utmCampaign: varchar("utm_campaign", { length: 120 }),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("audience_contacts_profile_idx").on(t.profileId),
    index("audience_contacts_email_idx").on(t.profileId, t.email),
  ],
);

export const audienceTags = pgTable(
  "audience_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 64 }).notNull(),
    color: varchar("color", { length: 16 }),
  },
  (t) => [uniqueIndex("audience_tags_uidx").on(t.profileId, t.name)],
);

export const contactTags = pgTable(
  "contact_tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    contactId: uuid("contact_id")
      .notNull()
      .references(() => audienceContacts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => audienceTags.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("contact_tags_uidx").on(t.contactId, t.tagId)],
);

export const forms = pgTable("forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  successMessage: text("success_message").default("Thanks! We'll be in touch."),
  redirectUrl: text("redirect_url"),
  notifyEmail: varchar("notify_email", { length: 320 }),
  webhookUrl: text("webhook_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const formFields = pgTable("form_fields", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 32 }).notNull(),
  label: varchar("label", { length: 160 }).notNull(),
  placeholder: varchar("placeholder", { length: 160 }),
  required: boolean("required").default(false).notNull(),
  options: jsonb("options").$type<string[]>().default([]),
  position: integer("position").default(0).notNull(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => audienceContacts.id, {
    onDelete: "set null",
  }),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  thumbnail: text("thumbnail"),
  inventoryLimit: integer("inventory_limit"),
  inventorySold: integer("inventory_sold").default(0).notNull(),
  status: varchar("status", { length: 32 }).default("draft").notNull(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const digitalFiles = pgTable("digital_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  storageKey: text("storage_key").notNull(),
  mimeType: varchar("mime_type", { length: 120 }),
  sizeBytes: integer("size_bytes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => audienceContacts.id, {
    onDelete: "set null",
  }),
  email: varchar("email", { length: 320 }).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
});

export const downloadTokens = pgTable("download_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  fileId: uuid("file_id")
    .notNull()
    .references(() => digitalFiles.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
  maxDownloads: integer("max_downloads").default(5).notNull(),
});

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  description: text("description"),
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  annualPrice: numeric("annual_price", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  stripeMonthlyPriceId: varchar("stripe_monthly_price_id", { length: 255 }),
  stripeAnnualPriceId: varchar("stripe_annual_price_id", { length: 255 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const features = pgTable("features", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
});

export const planFeatures = pgTable(
  "plan_features",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    featureId: uuid("feature_id")
      .notNull()
      .references(() => features.id, { onDelete: "cascade" }),
    limitValue: integer("limit_value"),
  },
  (t) => [uniqueIndex("plan_features_uidx").on(t.planId, t.featureId)],
);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: uuid("plan_id")
    .notNull()
    .references(() => plans.id),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  billingInterval: varchar("billing_interval", { length: 16 }).default("monthly"),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usageLimits = pgTable(
  "usage_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    featureKey: varchar("feature_key", { length: 64 }).notNull(),
    used: integer("used").default(0).notNull(),
    periodStart: timestamp("period_start", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("usage_limits_uidx").on(t.userId, t.featureKey)],
);
