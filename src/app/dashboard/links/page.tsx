import { eq, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { blocks, profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { LinksEditor } from "./links-editor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links",
};

export default async function LinksPage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) redirect("/onboarding");

  const profileBlocks = await db
    .select()
    .from(blocks)
    .where(eq(blocks.profileId, profile.id))
    .orderBy(asc(blocks.position));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Links & Blocks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, and reorder your page content.
        </p>
      </div>
      <LinksEditor
        profileId={profile.id}
        username={profile.username}
        initialBlocks={profileBlocks.map((b) => ({
          id: b.id,
          type: b.type,
          position: b.position,
          enabled: b.enabled,
          config: b.config as Record<string, unknown>,
        }))}
      />
    </div>
  );
}
