import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Settings, Globe, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and account settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Username</dt>
              <dd className="text-sm text-foreground">@{profile.username}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Display Name</dt>
              <dd className="text-sm text-foreground">
                {profile.displayName ?? "Not set"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Bio</dt>
              <dd className="text-sm text-foreground max-w-xs truncate">
                {profile.bio ?? "Not set"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm text-foreground">{user.email}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Page Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Visibility</dt>
              <dd>
                <Badge variant="secondary" className="capitalize">
                  {profile.visibility}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">Published</dt>
              <dd>
                <Badge variant={profile.isPublished ? "default" : "secondary"}>
                  {profile.isPublished ? "Live" : "Draft"}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                Show Branding
              </dt>
              <dd className="text-sm text-foreground">
                {profile.showBranding ? "Yes" : "No"}
              </dd>
            </div>
            {profile.customDomain && (
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-muted-foreground">
                  Custom Domain
                </dt>
                <dd className="text-sm text-foreground">{profile.customDomain}</dd>
              </div>
            )}
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">SEO Title</dt>
              <dd className="text-sm text-foreground">
                {profile.seoTitle ?? "Auto-generated"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
