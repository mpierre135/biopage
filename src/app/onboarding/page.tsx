import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth/session";
import { OnboardingWizard } from "./wizard";

export const metadata = { title: "Get Started | BioHub" };

export default async function OnboardingPage() {
  const user = await getCurrentDbUser();

  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <OnboardingWizard userId={user.id} />
    </div>
  );
}
