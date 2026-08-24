import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles, reservedUsernames } from "@/lib/db/schema";
import {
  validateUsername,
  normalizeUsername,
} from "@/lib/security/usernames";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u");

  if (!raw || raw.length < 3) {
    return NextResponse.json(
      { available: false, reason: "Username must be at least 3 characters." },
    );
  }

  const username = normalizeUsername(raw);
  const validation = validateUsername(username);

  if (!validation.valid) {
    return NextResponse.json({ available: false, reason: validation.reason });
  }

  const [existingProfile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);

  if (existingProfile) {
    return NextResponse.json({
      available: false,
      reason: "That username is already taken.",
    });
  }

  const [reserved] = await db
    .select({ username: reservedUsernames.username })
    .from(reservedUsernames)
    .where(eq(reservedUsernames.username, username))
    .limit(1);

  if (reserved) {
    return NextResponse.json({
      available: false,
      reason: "That username is reserved.",
    });
  }

  return NextResponse.json({ available: true });
}
