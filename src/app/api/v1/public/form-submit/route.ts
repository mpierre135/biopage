import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  profiles,
  audienceContacts,
  formSubmissions,
  forms,
} from "@/lib/db/schema";
import { ingestEvent } from "@/lib/analytics/ingest";
import { FORM_SUBMIT } from "@/lib/analytics/events";

const schema = z.object({
  profileUsername: z.string().min(1).max(64),
  blockId: z.string().uuid().optional(),
  values: z.record(z.string(), z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { profileUsername, blockId, values } = parsed.data;

    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.username, profileUsername.toLowerCase()))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const email =
      values.email ||
      values.Email ||
      Object.entries(values).find(([k]) => k.toLowerCase().includes("email"))?.[1];

    let contactId: string | null = null;
    if (email) {
      const [contact] = await db
        .insert(audienceContacts)
        .values({
          profileId: profile.id,
          email,
          firstName: values.firstName || values.name || null,
          source: "form",
          blockId: blockId ?? null,
        })
        .returning({ id: audienceContacts.id });
      contactId = contact.id;
    }

    // Ensure a lightweight form record exists for this profile (block-backed)
    const formName = `Block form ${blockId?.slice(0, 8) ?? "anon"}`;
    let [form] = await db
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.profileId, profile.id))
      .limit(1);

    if (!form) {
      [form] = await db
        .insert(forms)
        .values({
          profileId: profile.id,
          name: formName,
        })
        .returning({ id: forms.id });
    }

    await db.insert(formSubmissions).values({
      formId: form.id,
      contactId,
      data: values,
    });

    await ingestEvent({
      profileId: profile.id,
      eventType: FORM_SUBMIT,
      blockId,
      sessionId: `form_${Date.now()}`,
      visitorIdRaw: email ?? req.headers.get("user-agent") ?? "anon",
      metadata: { fields: Object.keys(values).length },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[form-submit]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
