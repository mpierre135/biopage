import { eq } from "drizzle-orm";
import { Eye, MousePointer, TrendingUp, Users, Plus, ExternalLink, Share2 } from "lucide-react";
import Link from "next/link";
import { getCurrentDbUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getAnalyticsOverview } from "@/lib/analytics/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const overview = profile
    ? await getAnalyticsOverview(profile.id, { from: thirtyDaysAgo, to: now })
    : null;

  const stats = [
    {
      label: "Total Views",
      value: overview?.totalViews ?? 0,
      icon: Eye,
    },
    {
      label: "Total Clicks",
      value: overview?.totalClicks ?? 0,
      icon: MousePointer,
    },
    {
      label: "CTR",
      value: `${((overview?.clickThroughRate ?? 0) * 100).toFixed(1)}%`,
      icon: TrendingUp,
    },
    {
      label: "Leads",
      value: overview?.totalLeads ?? 0,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {user.firstName ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Here&apos;s how your page is performing in the last 30 days.
        </p>
      </div>

      {/* Stats grid */}
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
                    {stat.value.toLocaleString?.() ?? stat.value}
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

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-medium text-slate-900">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/links">
            <Button
              variant="outline"
              className="cursor-pointer gap-2 min-h-[44px]"
            >
              <Plus className="size-4" />
              Add Link
            </Button>
          </Link>
          {profile && (
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="cursor-pointer gap-2 min-h-[44px]"
              >
                <ExternalLink className="size-4" />
                View Page
              </Button>
            </a>
          )}
          <Link href="/dashboard/qr">
            <Button
              variant="outline"
              className="cursor-pointer gap-2 min-h-[44px]"
            >
              <Share2 className="size-4" />
              Share
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div>
        <h2 className="mb-4 text-lg font-medium text-slate-900">
          Recent activity
        </h2>
        <Card>
          <CardContent className="flex min-h-[120px] items-center justify-center py-8">
            <p className="text-sm text-slate-500">
              Activity from your visitors will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
