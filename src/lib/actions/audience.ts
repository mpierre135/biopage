"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { audienceContacts, profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";

export async function exportAudienceCsv(profileId: string): Promise<{
  success: boolean;
  error?: string;
  csv?: string;
}> {
  const user = await getCurrentDbUser();
  const [profile] = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);

  if (!profile || profile.userId !== user.id) {
    return { success: false, error: "Access denied." };
  }

  if (!(await canUseFeature(user.id, "csvExport"))) {
    return { success: false, error: "Upgrade to Pro to export CSV." };
  }

  const contacts = await db
    .select()
    .from(audienceContacts)
    .where(eq(audienceContacts.profileId, profileId));

  const header = [
    "email",
    "phone",
    "firstName",
    "lastName",
    "source",
    "createdAt",
  ];
  const rows = contacts.map((c) =>
    [
      c.email ?? "",
      c.phone ?? "",
      c.firstName ?? "",
      c.lastName ?? "",
      c.source ?? "",
      c.createdAt.toISOString(),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );

  return {
    success: true,
    csv: [header.join(","), ...rows].join("\n"),
  };
}
