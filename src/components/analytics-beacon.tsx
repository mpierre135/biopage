"use client";

import { useEffect, useCallback } from "react";

export function AnalyticsBeacon({ profileId }: { profileId: string }) {
  const track = useCallback(
    (eventType: string, extra?: Record<string, unknown>) => {
      const sessionId =
        sessionStorage.getItem("bh_sid") || crypto.randomUUID();
      sessionStorage.setItem("bh_sid", sessionId);

      const visitorId =
        localStorage.getItem("bh_vid") || crypto.randomUUID();
      localStorage.setItem("bh_vid", visitorId);

      fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          eventType,
          sessionId,
          visitorIdRaw: visitorId,
          referrer: document.referrer || undefined,
          ...extra,
        }),
        keepalive: true,
      }).catch(() => {});
    },
    [profileId],
  );

  useEffect(() => {
    track("profile_view");
  }, [track]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-event]",
      );
      if (!target) return;

      const eventType = target.dataset.event || "link_click";
      const blockId = target.dataset.blockId;
      const url = target.getAttribute("href") ?? target.dataset.url;

      track(eventType, {
        blockId: blockId || undefined,
        metadata: url ? { url } : undefined,
      });
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () =>
      document.removeEventListener("click", handleClick, { capture: true });
  }, [track]);

  return null;
}
