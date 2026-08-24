"use client";

import { useEffect, useRef } from "react";

function generateSessionId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getVisitorIdRaw(): string {
  const nav = typeof navigator !== "undefined" ? navigator : null;
  const screen = typeof window !== "undefined" ? window.screen : null;
  return [
    nav?.userAgent ?? "",
    nav?.language ?? "",
    screen?.width ?? 0,
    screen?.height ?? 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
}

function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const val = params.get(key);
    if (val) utm[key.replace("utm_", "utmSource").length ? key : key] = val;
  }
  return {
    ...(params.get("utm_source") ? { utmSource: params.get("utm_source")! } : {}),
    ...(params.get("utm_medium") ? { utmMedium: params.get("utm_medium")! } : {}),
    ...(params.get("utm_campaign") ? { utmCampaign: params.get("utm_campaign")! } : {}),
    ...(params.get("utm_term") ? { utmTerm: params.get("utm_term")! } : {}),
    ...(params.get("utm_content") ? { utmContent: params.get("utm_content")! } : {}),
  };
}

export function AnalyticsBeacon({ profileId }: { profileId: string }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const sessionId = generateSessionId();
    const visitorIdRaw = getVisitorIdRaw();
    const utmParams = getUtmParams();

    fetch("/api/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        eventType: "profile_view",
        sessionId,
        visitorIdRaw,
        referrer: document.referrer || undefined,
        ...utmParams,
      }),
      keepalive: true,
    }).catch(() => {});

    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("[data-block-id]");
      if (!target) return;

      const blockId = target.getAttribute("data-block-id");
      const eventType = target.getAttribute("data-event") ?? "link_click";
      if (!blockId) return;

      fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          eventType,
          blockId,
          sessionId,
          visitorIdRaw,
          ...utmParams,
        }),
        keepalive: true,
      }).catch(() => {});
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [profileId]);

  return null;
}
