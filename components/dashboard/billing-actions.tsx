"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { safeApiRequest } from "@/lib/client-api";

type UpgradePlan = "pro" | "vendor";
type UpgradeCycle = "monthly" | "yearly";

interface BillingActionsProps {
  currentPlan: "free" | "pro" | "vendor";
}

export function BillingActions({ currentPlan }: BillingActionsProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function startCheckout(plan: UpgradePlan, billingCycle: UpgradeCycle) {
    const key = `${plan}:${billingCycle}`;

    try {
      setLoadingKey(key);
      const result = await safeApiRequest<{ data?: { checkoutUrl?: string } }>(
        "/api/stripe/subscriptions/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ plan, billingCycle })
        }
      );

      const checkoutUrl = result.data?.data?.checkoutUrl;

      if (!result.ok || !checkoutUrl) {
        throw new Error(result.error ?? "Checkout could not be started.");
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected billing error.";
      window.alert(message);
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        variant="outline"
        disabled={currentPlan === "pro" || loadingKey !== null}
        onClick={() => void startCheckout("pro", "monthly")}
      >
        {loadingKey === "pro:monthly" ? "Redirecting..." : "Upgrade to Pro (Monthly)"}
      </Button>
      <Button
        variant="outline"
        disabled={currentPlan === "pro" || loadingKey !== null}
        onClick={() => void startCheckout("pro", "yearly")}
      >
        {loadingKey === "pro:yearly" ? "Redirecting..." : "Upgrade to Pro (Yearly)"}
      </Button>
      <Button
        disabled={currentPlan === "vendor" || loadingKey !== null}
        onClick={() => void startCheckout("vendor", "monthly")}
      >
        {loadingKey === "vendor:monthly" ? "Redirecting..." : "Upgrade to Vendor (Monthly)"}
      </Button>
      <Button
        disabled={currentPlan === "vendor" || loadingKey !== null}
        onClick={() => void startCheckout("vendor", "yearly")}
      >
        {loadingKey === "vendor:yearly" ? "Redirecting..." : "Upgrade to Vendor (Yearly)"}
      </Button>
    </div>
  );
}
