import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth/session";
import { OnboardingForm } from "./onboarding-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started",
};

export default async function OnboardingPage() {
  const user = await getCurrentDbUser();

  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4">
      <OnboardingForm
        firstName={user.firstName ?? ""}
      />
    </div>
  );
}
