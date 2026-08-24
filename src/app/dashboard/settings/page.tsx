import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";
import { SettingsForm } from "./settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) redirect("/onboarding");

  const canRemoveBranding = await canUseFeature(user.id, "removeBranding");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and page settings.
        </p>
      </div>

      <SettingsForm
        profileId={profile.id}
        canRemoveBranding={canRemoveBranding}
        initial={{
          displayName: profile.displayName ?? "",
          bio: profile.bio ?? "",
          location: profile.location ?? "",
          seoTitle: profile.seoTitle ?? "",
          seoDescription: profile.seoDescription ?? "",
          isPublished: profile.isPublished,
          showBranding: profile.showBranding,
          visibility: profile.visibility as "public" | "unlisted" | "private",
        }}
      />
    </div>
  );
}
