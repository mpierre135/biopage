import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { integrations } from "@/lib/db/schema";

type Lead = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function subscribeMailchimp(
  credentials: Record<string, unknown>,
  config: Record<string, unknown>,
  lead: Lead,
): Promise<void> {
  const apiKey = str(credentials.apiKey);
  const listId = str(config.listId) || str(credentials.listId);
  const email = lead.email?.trim();
  if (!apiKey || !listId || !email) return;

  const dc = apiKey.split("-").pop();
  if (!dc || dc === apiKey) return;

  const res = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/lists/${encodeURIComponent(listId)}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`biohub:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: lead.firstName
          ? { FNAME: lead.firstName }
          : undefined,
      }),
    },
  );

  // 400 "already subscribed" is fine.
  if (!res.ok && res.status !== 400) {
    console.error("[mailchimp] subscribe failed", res.status);
  }
}

async function subscribeKlaviyo(
  credentials: Record<string, unknown>,
  lead: Lead,
): Promise<void> {
  const apiKey = str(credentials.apiKey);
  const email = lead.email?.trim();
  if (!apiKey || !email) return;

  const res = await fetch("https://a.klaviyo.com/api/profiles/", {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${apiKey}`,
      revision: "2024-10-15",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          email,
          first_name: lead.firstName ?? undefined,
          phone_number: lead.phone ?? undefined,
        },
      },
    }),
  });

  if (!res.ok && res.status !== 409) {
    console.error("[klaviyo] subscribe failed", res.status);
  }
}

/**
 * Best-effort fan-out of a captured lead to connected email tools.
 * Never throws — capture must succeed even if a destination is down.
 */
export async function forwardCapturedLead(
  profileId: string,
  lead: Lead,
): Promise<void> {
  try {
    const rows = await db
      .select()
      .from(integrations)
      .where(eq(integrations.profileId, profileId));

    await Promise.all(
      rows
        .filter((row) => row.enabled)
        .map(async (row) => {
          const credentials = asRecord(row.credentials);
          const config = asRecord(row.config);
          if (row.provider === "mailchimp") {
            await subscribeMailchimp(credentials, config, lead);
            return;
          }
          if (row.provider === "klaviyo") {
            await subscribeKlaviyo(credentials, lead);
          }
        }),
    );
  } catch (err) {
    console.error("[integrations] lead forward failed", err);
  }
}
