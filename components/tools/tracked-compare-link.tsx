"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";

interface TrackedCompareLinkProps extends LinkProps {
  sourceSlug: string;
  targetSlug: string;
  className?: string;
  children: ReactNode;
}

export function TrackedCompareLink({
  sourceSlug,
  targetSlug,
  className,
  children,
  ...props
}: TrackedCompareLinkProps) {
  function trackClick() {
    const payload = JSON.stringify({ sourceSlug, targetSlug });

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/tools/compare-click", blob);
      return;
    }

    void fetch("/api/tools/compare-click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: payload,
      keepalive: true
    }).catch(() => {
      // Ignore analytics failures for navigation links.
    });
  }

  return (
    <Link {...props} className={className} onClick={trackClick}>
      {children}
    </Link>
  );
}
