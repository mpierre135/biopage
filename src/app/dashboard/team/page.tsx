import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profileMembers, profiles, users } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";
import { TeamClient } from "./team-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const user = await getCurrentDbUser();
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  if (!profile) redirect("/onboarding");

  const canUse = await canUseFeature(user.id, "teams");
  const members = await db
    .select({
      id: profileMembers.id,
      role: profileMembers.role,
      email: users.email,
      firstName: users.firstName,
    })
    .from(profileMembers)
    .innerJoin(users, eq(profileMembers.userId, users.id))
    .where(eq(profileMembers.profileId, profile.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite people who already have a BioHub account to collaborate.
        </p>
      </div>
      <TeamClient canUse={canUse} initial={members} />
    </div>
  );
}
