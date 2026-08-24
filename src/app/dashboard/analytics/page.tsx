import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { BarChart3, Eye, MousePointer, TrendingUp, Users, Globe, Monitor } from "lucide-react";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import {
  getAnalyticsOverview,
  getTopLinks,
  getTrafficSources,
  getDeviceBreakdown,
} from "@/lib/analytics/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AnalyticsPage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) redirect("/onboarding");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const range = { from: thirtyDaysAgo, to: now };

  const [overview, topLinks, trafficSources, deviceBreakdown] = await Promise.all([
    getAnalyticsOverview(profile.id, range),
    getTopLinks(profile.id, range),
    getTrafficSources(profile.id, range),
    getDeviceBreakdown(profile.id, range),
  ]);

  const stats = [
    { label: "Views", value: overview.totalViews, icon: Eye },
    { label: "Clicks", value: overview.totalClicks, icon: MousePointer },
    { label: "CTR", value: `${(overview.clickThroughRate * 100).toFixed(1)}%`, icon: TrendingUp },
    { label: "Leads", value: overview.totalLeads, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last 30 days performance overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {typeof stat.value === "number"
                      ? stat.value.toLocaleString()
                      : stat.value}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                  <stat.icon className="size-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trafficSources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No traffic data yet.</p>
            ) : (
              <div className="space-y-3">
                {trafficSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <span className="text-sm text-foreground capitalize">{source.source}</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {source.visits.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No device data yet.</p>
            ) : (
              <div className="space-y-3">
                {deviceBreakdown.map((d) => (
                  <div key={d.device} className="flex items-center justify-between">
                    <span className="text-sm text-foreground capitalize">{d.device}</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {d.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Top Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No link clicks recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {topLinks.map((link, i) => (
                <div key={link.blockId} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">
                    #{i + 1} — {link.blockId.slice(0, 8)}...
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {link.clicks.toLocaleString()} clicks
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
