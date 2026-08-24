import { eq } from "drizzle-orm";
import { Check, Palette } from "lucide-react";
import { getCurrentDbUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles, themes } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function DesignPage() {
  const user = await getCurrentDbUser();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const allThemes = await db
    .select()
    .from(themes)
    .where(eq(themes.isActive, true));

  const designConfig = (profile?.designConfig ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Design</h1>
        <p className="mt-1 text-sm text-slate-600">
          Customize the look and feel of your bio page.
        </p>
      </div>

      {/* Theme picker */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Themes</h2>
        {allThemes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Palette className="size-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-900">
                No themes available
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Themes will appear here once configured.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allThemes.map((theme) => {
              const isActive = profile?.themeId === theme.id;
              const config = theme.config as Record<string, unknown>;

              return (
                <button
                  key={theme.id}
                  className={cn(
                    "relative flex flex-col items-center rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                    "min-h-[44px]",
                    isActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  )}
                >
                  {/* Theme preview */}
                  <div
                    className="mb-3 h-24 w-full rounded-lg"
                    style={{
                      background:
                        (config.background as string) ??
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  />
                  <span className="text-sm font-medium text-slate-900">
                    {theme.name}
                  </span>
                  {theme.isPremium && (
                    <span className="mt-1 text-xs text-indigo-600 font-medium">
                      Premium
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-indigo-600">
                      <Check className="size-3.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Color customization */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Colors</h2>
        <Card>
          <CardContent className="pt-4">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="color-primary"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-lg border border-slate-200"
                    style={{
                      backgroundColor:
                        (designConfig.primaryColor as string) ?? "#6366f1",
                    }}
                  />
                  <span className="text-sm text-slate-600 font-mono">
                    {(designConfig.primaryColor as string) ?? "#6366f1"}
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="color-background"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Background
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-lg border border-slate-200"
                    style={{
                      backgroundColor:
                        (designConfig.backgroundColor as string) ?? "#ffffff",
                    }}
                  />
                  <span className="text-sm text-slate-600 font-mono">
                    {(designConfig.backgroundColor as string) ?? "#ffffff"}
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="color-text"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Text Color
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-lg border border-slate-200"
                    style={{
                      backgroundColor:
                        (designConfig.textColor as string) ?? "#1e293b",
                    }}
                  />
                  <span className="text-sm text-slate-600 font-mono">
                    {(designConfig.textColor as string) ?? "#1e293b"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Button style preview */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-slate-900">
          Button Preview
        </h2>
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div
                className="rounded-lg px-6 py-3 text-sm font-medium text-white transition-transform duration-200 hover:scale-105"
                style={{
                  backgroundColor:
                    (designConfig.primaryColor as string) ?? "#6366f1",
                }}
              >
                Filled Button
              </div>
              <div
                className="rounded-lg border-2 px-6 py-3 text-sm font-medium transition-transform duration-200 hover:scale-105"
                style={{
                  borderColor:
                    (designConfig.primaryColor as string) ?? "#6366f1",
                  color: (designConfig.primaryColor as string) ?? "#6366f1",
                }}
              >
                Outline Button
              </div>
              <div
                className="rounded-full px-6 py-3 text-sm font-medium text-white transition-transform duration-200 hover:scale-105"
                style={{
                  backgroundColor:
                    (designConfig.primaryColor as string) ?? "#6366f1",
                }}
              >
                Rounded Button
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Font selection placeholder */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-slate-900">Typography</h2>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-slate-500">
              Font customization coming soon.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
