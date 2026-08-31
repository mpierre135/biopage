CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dismissed_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"rule_key" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "show_follower_total" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "collection_id" uuid;
--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "archived_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "follower_count" integer;
--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "follower_source" varchar(16);
--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "follower_synced_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "social_links" ADD COLUMN "follower_sync_status" varchar(16) DEFAULT 'manual' NOT NULL;
--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dismissed_suggestions" ADD CONSTRAINT "dismissed_suggestions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "collections_profile_position_idx" ON "collections" USING btree ("profile_id","position");
--> statement-breakpoint
CREATE UNIQUE INDEX "dismissed_suggestions_profile_rule_uidx" ON "dismissed_suggestions" USING btree ("profile_id","rule_key");
