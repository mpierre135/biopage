import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { integrations, profiles } from "@/lib/db/schema";
import { getUserByClerkId } from "@/lib/auth/users";
import { isOauthProvider } from "@/lib/integrations/catalog";
import {
  decodeOauthState,
  exchangeOauthCode,
  oauthStateCookieName,
} from "@/lib/integrations/oauth";

function redirectToIntegrations(req: NextRequest, query: Record<string, string>) {
  const url = new URL("/dashboard/integrations", req.url);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  const res = NextResponse.redirect(url);
  res.cookies.set({
    name: oauthStateCookieName(),
    value: "",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider: raw } = await params;
  if (!isOauthProvider(raw)) {
    return redirectToIntegrations(req, { error: "Unknown integration." });
  }

  const errorParam = req.nextUrl.searchParams.get("error");
  if (errorParam) {
    return redirectToIntegrations(req, {
      error: "Connection was canceled.",
    });
  }

  const code = req.nextUrl.searchParams.get("code");
  const stateRaw =
    req.nextUrl.searchParams.get("state") ??
    req.cookies.get(oauthStateCookieName())?.value;
  const state = decodeOauthState(stateRaw ?? undefined);
  if (!code || !state || state.provider !== raw) {
    return redirectToIntegrations(req, {
      error: "This connection expired. Try again.",
    });
  }

  const shopFromQuery = req.nextUrl.searchParams.get("shop");
  const shop = state.shop ?? shopFromQuery ?? undefined;

  try {
    const exchanged = await exchangeOauthCode(raw, code, shop);
    const user = await getUserByClerkId(state.clerkUserId);
    if (!user) {
      return redirectToIntegrations(req, {
        error: "Sign in again, then reconnect.",
      });
    }

    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);
    if (!profile) {
      return redirectToIntegrations(req, {
        error: "Finish onboarding first.",
      });
    }

    const [prev] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.profileId, profile.id),
          eq(integrations.provider, raw),
        ),
      )
      .limit(1);
    const prevConfig =
      prev?.config && typeof prev.config === "object" ? prev.config : {};

    await db
      .insert(integrations)
      .values({
        profileId: profile.id,
        provider: raw,
        credentials: exchanged.credentials,
        config: { ...prevConfig, ...exchanged.config },
        enabled: true,
      })
      .onConflictDoUpdate({
        target: [integrations.profileId, integrations.provider],
        set: {
          credentials: exchanged.credentials,
          config: { ...prevConfig, ...exchanged.config },
          enabled: true,
        },
      });

    return redirectToIntegrations(req, { connected: raw });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Connection failed.";
    return redirectToIntegrations(req, { error: message });
  }
}
