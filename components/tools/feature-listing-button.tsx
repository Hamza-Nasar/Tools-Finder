"use client";

import { useMemo, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import type { ListingPlan } from "@/types";
import { Button } from "@/components/ui/button";

interface FeatureListingButtonProps {
  toolSlug: string;
  isFeatured: boolean;
  featuredUntil?: string | null;
  plans: ListingPlan[];
}

export function FeatureListingButton({
  toolSlug,
  isFeatured,
  featuredUntil,
  plans
}: FeatureListingButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedPlanId, setSelectedPlanId] = useState<ListingPlan["id"]>(plans[0]?.id ?? "monthly");
  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? plans[0],
    [plans, selectedPlanId]
  );

  function handleCheckout() {
    startTransition(async () => {
      setMessage(null);

      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ toolSlug, planId: selectedPlan?.id })
        });
        const payload = (await response.json()) as {
          data?: { checkoutUrl?: string | null };
          error?: string;
        };

        if (!response.ok || !payload.data?.checkoutUrl) {
          setMessage(payload.error ?? "Unable to start checkout.");
          return;
        }

        window.location.assign(payload.data.checkoutUrl);
      } catch {
        setMessage("Unable to start checkout.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <label htmlFor={`feature-plan-${toolSlug}`} className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Paid plan
        </label>
        <select
          id={`feature-plan-${toolSlug}`}
          className="field-select"
          value={selectedPlanId}
          onChange={(event) => setSelectedPlanId(event.target.value as ListingPlan["id"])}
          disabled={isPending}
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} · {plan.summaryLabel}
            </option>
          ))}
        </select>
      </div>
      <Button type="button" variant="secondary" className="w-full" onClick={handleCheckout} disabled={isPending}>
        <Sparkles className="mr-2 h-4 w-4" />
        {isPending ? "Redirecting..." : isFeatured ? "Extend featured listing" : "Feature this tool"}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        {selectedPlan
          ? isFeatured && featuredUntil
            ? `Current placement runs until ${new Date(featuredUntil).toLocaleDateString()}. Extend with ${selectedPlan.name} for ${selectedPlan.summaryLabel}.`
            : `${selectedPlan.name} costs ${selectedPlan.summaryLabel} and unlocks homepage plus category spotlight placement.`
          : "Choose a paid plan to feature this tool."}
      </p>
      {message ? <p className="text-xs text-destructive">{message}</p> : null}
    </div>
  );
}
