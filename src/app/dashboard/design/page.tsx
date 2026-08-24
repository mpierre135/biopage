import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Check, Palette } from "lucide-react";
import { db } from "@/lib/db";
import { profiles, themes } from "@/lib/db/schema";
import { getCurrentDbUser } from "@/lib/auth/session";
import { THEME_PRESETS } from "@/lib/themes/presets";
import { themeToCssVars, cssVarsToStyle } from "@/lib/themes/resolver";
import { Card, CardContent } from "@/components/ui/card";
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

  const currentThemeId = profile.themeId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Design</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a theme for your public page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {THEME_PRESETS.map((preset) => {
          const vars = themeToCssVars(preset.config);
          const bgStyle = cssVarsToStyle(vars);
          const bg = preset.config.background?.gradient ?? preset.config.background?.color ?? "#fff";

          return (
            <Card
              key={preset.slug}
              className="group relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <CardContent className="p-0">
                <div
                  className="flex h-32 flex-col items-center justify-center gap-2 p-4"
                  style={{
                    background: bg,
                    color: preset.config.colors?.text ?? "#000",
                  }}
                >
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{
                      backgroundColor: preset.config.colors?.primary ?? "#6366f1",
                    }}
                  />
                  <div
                    className="h-2 w-16 rounded-full"
                    style={{
                      backgroundColor: preset.config.buttons?.backgroundColor ??
                        preset.config.colors?.primary ?? "#6366f1",
                      borderRadius: preset.config.buttons?.radius === "full" ? "9999px" : "6px",
                    }}
                  />
                  <div
                    className="h-2 w-12 rounded-full"
                    style={{
                      backgroundColor: preset.config.buttons?.backgroundColor ??
                        preset.config.colors?.primary ?? "#6366f1",
                      opacity: 0.6,
                      borderRadius: preset.config.buttons?.radius === "full" ? "9999px" : "6px",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {preset.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {preset.category}
                      {preset.isPremium && " · Premium"}
                    </p>
                  </div>
                  {preset.isPremium && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      Pro
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {THEME_PRESETS.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No themes available yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
