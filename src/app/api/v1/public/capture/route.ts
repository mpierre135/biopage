import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, audienceContacts } from "@/lib/db/schema";

const captureSchema = z.object({
  type: z.enum(["email", "sms"]),
  profileUsername: z.string().min(1).max(64),
  blockId: z.string().uuid().optional(),
  email: z.string().email().max(320).optional(),
  phone: z.string().min(7).max(32).optional(),
  firstName: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = captureSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { type, profileUsername, blockId, email, phone, firstName } = parsed.data;

    if (type === "email" && !email) {
      return NextResponse.json(
        { error: "Email is required for email capture" },
        { status: 400 },
      );
    }

    if (type === "sms" && !phone) {
      return NextResponse.json(
        { error: "Phone is required for SMS capture" },
        { status: 400 },
      );
    }

    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.username, profileUsername.toLowerCase()))
      .limit(1);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await db.insert(audienceContacts).values({
      profileId: profile.id,
      email: email ?? null,
      phone: phone ?? null,
      firstName: firstName ?? null,
      source: type === "email" ? "email_capture" : "sms_capture",
      blockId: blockId ?? null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
