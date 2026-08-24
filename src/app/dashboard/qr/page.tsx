import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { QrClient } from "./qr-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code",
};

export default async function QRCodePage() {
  const user = await getCurrentDbUser();
  const [profile] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) redirect("/onboarding");

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  const url = `${appUrl}/${profile.username}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">QR Code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a QR code for your page. Download and share anywhere.
        </p>
      </div>
      <QrClient url={url} username={profile.username} />
    </div>
  );
}
