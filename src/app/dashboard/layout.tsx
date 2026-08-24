import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar
        user={{ firstName: user.firstName, imageUrl: user.imageUrl }}
      />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
