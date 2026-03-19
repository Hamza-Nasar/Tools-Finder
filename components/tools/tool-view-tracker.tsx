"use client";

import { useEffect } from "react";

interface ToolViewTrackerProps {
  slug: string;
}

export function ToolViewTracker({ slug }: ToolViewTrackerProps) {
  useEffect(() => {
    const storageKey = `tool-view:${slug}`;

    if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey)) {
      return;
    }

    const controller = new AbortController();

    void fetch(`/api/tools/${slug}/view`, {
      method: "POST",
      signal: controller.signal,
      keepalive: true
    })
      .then(() => {
        window.sessionStorage.setItem(storageKey, "1");
      })
      .catch(() => {
        // Ignore analytics failures on the client.
      });

    return () => controller.abort();
  }, [slug]);

  return null;
}
