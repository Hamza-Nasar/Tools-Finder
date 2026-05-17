"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function BillingStatusSync({
  enabled,
  expectedPlans,
  sessionId
}: {
  enabled: boolean;
  expectedPlans: Array<"pro" | "vendor">;
  sessionId?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (sessionId) {
        try {
          await fetch("/api/stripe/subscriptions/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId })
          });
        } catch {
          // Keep polling fallback below.
        }
      }

      let attempts = 0;
      const timer = window.setInterval(async () => {
        if (cancelled) {
          window.clearInterval(timer);
          return;
        }
        attempts += 1;
        try {
          const response = await fetch("/api/account/plan", { cache: "no-store" });
          if (!response.ok) {
            return;
          }
          const payload = (await response.json()) as {
            data?: { plan?: "free" | "pro" | "vendor" };
          };
          const plan = payload.data?.plan;
          if (plan && expectedPlans.includes(plan as "pro" | "vendor")) {
            window.clearInterval(timer);
            router.refresh();
            return;
          }
        } catch {
          // Silent retry
        }

        if (attempts >= 6) {
          window.clearInterval(timer);
        }
      }, 2500);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [enabled, expectedPlans, router, sessionId]);

  return null;
}
