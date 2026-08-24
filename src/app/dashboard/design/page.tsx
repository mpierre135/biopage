import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { canUseFeature } from "@/lib/billing/entitlements";
import { ThemePicker } from "./theme-picker";
import { CustomDesignEditor } from "./custom-design-editor";
import type { Metadata } from "next";
import type { ThemeConfig } from "@/lib/themes/types";

export const metadata: Metadata = {
  title: "Design",
};

export default async function DesignPage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (!profile) redirect("/onboarding");

  const canUsePremium = await canUseFeature(user.id, "customThemes");
  const design = (profile.designConfig as ThemeConfig & { slug?: string }) ?? {};
  const currentThemeSlug =
    typeof design === "object" && design && "slug" in design
      ? String((design as { slug?: string }).slug ?? "")
      : null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Design</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start from a theme, or build a fully custom look with your own colors
          and background image.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Custom design</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a background photo, tune overlay, colors, fonts, and buttons.
          </p>
        </div>
        <CustomDesignEditor
          profileId={profile.id}
          canCustomize={canUsePremium}
          initial={design}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">Theme presets</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One-click starting points. Applying a preset replaces your custom
            design.
          </p>
        </div>
        <ThemePicker
          profileId={profile.id}
          currentThemeSlug={currentThemeSlug || null}
          canUsePremium={canUsePremium}
        />
      </section>
    </div>
  );
}
