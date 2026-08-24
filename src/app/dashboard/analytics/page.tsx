import { eq, and, gte, lte, desc } from "drizzle-orm";
import { Eye, MousePointer, TrendingUp, Users } from "lucide-react";
import { getCurrentDbUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles, analyticsDaily } from "@/lib/db/schema";
import {
  getAnalyticsOverview,
  getTopLinks,
  getTrafficSources,
  getDeviceBreakdown,
} from "@/lib/analytics/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getRangeFromDays(days: number) {
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to: now };
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const days = params.range === "90" ? 90 : params.range === "7" ? 7 : 30;
  const range = getRangeFromDays(days);

  const overview = profile
    ? await getAnalyticsOverview(profile.id, range)
    : null;
  const topLinks = profile ? await getTopLinks(profile.id, range) : [];
  const trafficSources = profile
    ? await getTrafficSources(profile.id, range)
    : [];
  const deviceBreakdown = profile
    ? await getDeviceBreakdown(profile.id, range)
    : [];

  const dailyData = profile
    ? await db
        .select()
        .from(analyticsDaily)
        .where(
          and(
            eq(analyticsDaily.profileId, profile.id),
            gte(analyticsDaily.date, range.from),
            lte(analyticsDaily.date, range.to)
          )
        )
        .orderBy(analyticsDaily.date)
    : [];

  const stats = [
    { label: "Views", value: overview?.totalViews ?? 0, icon: Eye },
    { label: "Clicks", value: overview?.totalClicks ?? 0, icon: MousePointer },
    {
      label: "CTR",
      value: `${((overview?.clickThroughRate ?? 0) * 100).toFixed(1)}%`,
      icon: TrendingUp,
    },
    { label: "Leads", value: overview?.totalLeads ?? 0, icon: Users },
  ];

  const maxViews = Math.max(...dailyData.map((d) => d.views), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track your page performance.
          </p>
        </div>

        {/* Date range selector */}
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {[
            { label: "7d", value: "7" },
            { label: "30d", value: "30" },
            { label: "90d", value: "90" },
          ].map((option) => (
            <a
              key={option.value}
              href={`/dashboard/analytics?range=${option.value}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 cursor-pointer min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                String(days) === option.value
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {option.label}
            </a>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
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

      {/* Bar chart (CSS/SVG) */}
      <Card>
        <CardHeader>
          <CardTitle>Views over time</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyData.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No data available for this period.
            </p>
          ) : (
            <div className="flex h-48 items-end gap-1">
              {dailyData.map((day) => {
                const height = (day.views / maxViews) * 100;
                return (
                  <div
                    key={day.id}
                    className="group relative flex-1"
                    title={`${day.views} views`}
                  >
                    <div
                      className="w-full rounded-t bg-indigo-500 transition-all duration-200 hover:bg-indigo-600"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top links */}
        <Card>
          <CardHeader>
            <CardTitle>Top Links</CardTitle>
          </CardHeader>
          <CardContent>
            {topLinks.length === 0 ? (
              <p className="text-sm text-slate-500">No click data yet.</p>
            ) : (
              <div className="space-y-3">
                {topLinks.map((link, idx) => (
                  <div
                    key={link.blockId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded bg-slate-100 text-xs font-medium text-slate-600">
                        {idx + 1}
                      </span>
                      <span className="truncate text-sm text-slate-700">
                        {link.blockId.slice(0, 8)}...
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {link.clicks.toLocaleString()} clicks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Traffic sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {trafficSources.length === 0 ? (
              <p className="text-sm text-slate-500">No source data yet.</p>
            ) : (
              <div className="space-y-3">
                {trafficSources.map((src) => (
                  <div
                    key={src.source}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-700 capitalize">
                      {src.source}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {src.visits.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {deviceBreakdown.length === 0 ? (
            <p className="text-sm text-slate-500">No device data yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {deviceBreakdown.map((device) => {
                const total = deviceBreakdown.reduce(
                  (sum, d) => sum + d.count,
                  0
                );
                const pct = total > 0 ? (device.count / total) * 100 : 0;
                return (
                  <div key={device.device} className="text-center">
                    <p className="text-2xl font-semibold text-slate-900">
                      {pct.toFixed(0)}%
                    </p>
                    <p className="mt-1 text-sm text-slate-600 capitalize">
                      {device.device}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
