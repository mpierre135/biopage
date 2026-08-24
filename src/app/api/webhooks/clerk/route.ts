import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { upsertUserFromClerk } from "@/lib/auth/users";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string; id: string }[];
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
};

function verifyWebhookSignature(
  payload: string,
  headers: {
    webhookId: string | null;
    webhookTimestamp: string | null;
    webhookSignature: string | null;
  },
  secret: string,
): boolean {
  const { webhookId, webhookTimestamp, webhookSignature } = headers;
  if (!webhookId || !webhookTimestamp || !webhookSignature) return false;

  const ts = parseInt(webhookTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const toSign = `${webhookId}.${webhookTimestamp}.${payload}`;
  const expectedSig = crypto
    .createHmac("sha256", secretBytes)
    .update(toSign)
    .digest("base64");

  const signatures = webhookSignature.split(" ");
  return signatures.some((sig) => {
    const sigValue = sig.replace(/^v1,/, "");
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSig),
        Buffer.from(sigValue),
      );
    } catch {
      return false;
    }
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  const rawBody = await req.text();

  if (secret) {
    const valid = verifyWebhookSignature(
      rawBody,
      {
        webhookId: req.headers.get("webhook-id"),
        webhookTimestamp: req.headers.get("webhook-timestamp"),
        webhookSignature: req.headers.get("webhook-signature"),
      },
      secret,
    );

    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("[clerk-webhook] CLERK_WEBHOOK_SIGNING_SECRET not set — accepting unverified in dev mode");
  }

  let event: ClerkWebhookEvent;
  try {
    event = JSON.parse(rawBody) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = event;

  switch (type) {
    case "user.created":
    case "user.updated": {
      const primaryEmail =
        data.email_addresses?.find((e) => e.id === data.primary_email_address_id)
          ?.email_address ??
        data.email_addresses?.[0]?.email_address ??
        "";

      await upsertUserFromClerk({
        clerkId: data.id,
        email: primaryEmail,
        firstName: data.first_name,
        lastName: data.last_name,
        imageUrl: data.image_url,
      });
      break;
    }
    case "user.deleted": {
      if (data.id) {
        await db.delete(users).where(eq(users.clerkId, data.id));
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
