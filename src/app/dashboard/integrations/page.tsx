import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { integrations, profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";
import { getPlatformFlags } from "@/lib/integrations/catalog";
import {
  IntegrationsClient,
  type IntegrationStatus,
} from "./integrations-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Integrations" };

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const user = await getCurrentDbUser();
  const params = await searchParams;
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (!profile) redirect("/onboarding");

  const canUse = await canUseFeature(user.id, "integrations");
  const rows = await db
    .select()
    .from(integrations)
    .where(eq(integrations.profileId, profile.id));

  const initial: IntegrationStatus[] = rows
    .filter((r) =>
      ["shopify", "spotify", "meta", "mailchimp", "klaviyo"].includes(
        r.provider,
      ),
    )
    .map((r) => {
      const credentials = asRecord(r.credentials);
      const config = asRecord(r.config);
      const oauthConnected = Boolean(
        credentials.accessToken || credentials.refreshToken,
      );
      const accountLabel =
        typeof config.shopName === "string"
          ? config.shopName
          : typeof config.displayName === "string"
            ? config.displayName
            : typeof config.name === "string"
              ? config.name
              : oauthConnected
                ? "Connected"
                : typeof credentials.apiKey === "string"
                  ? "API key saved"
                  : null;
      return {
        provider: r.provider,
        enabled: r.enabled,
        oauthConnected,
        accountLabel,
        shop: typeof config.shop === "string" ? config.shop : null,
        listId: typeof config.listId === "string" ? config.listId : null,
      };
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect the accounts that power commerce, music, ads, and email.
          Signing into BioHub itself (Google, Facebook, GitHub) happens on the
          sign-in page.
        </p>
      </div>
      {params.connected ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Connected {params.connected}.
        </div>
      ) : null}
      {params.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {params.error}
        </div>
      ) : null}
      <IntegrationsClient
        canUse={canUse}
        platform={getPlatformFlags()}
        initial={initial}
      />
    </div>
  );
}
