"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureListingButtonProps {
  toolSlug: string;
  isFeatured: boolean;
  featuredUntil?: string | null;
}

export function FeatureListingButton({
  toolSlug,
  isFeatured,
  featuredUntil
}: FeatureListingButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckout() {
    startTransition(async () => {
      setMessage(null);

      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ toolSlug })
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
      <Button type="button" variant="secondary" className="w-full" onClick={handleCheckout} disabled={isPending}>
        <Sparkles className="mr-2 h-4 w-4" />
        {isPending ? "Redirecting..." : isFeatured ? "Extend featured listing" : "Feature this tool"}
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        {isFeatured && featuredUntil
          ? `Current placement runs until ${new Date(featuredUntil).toLocaleDateString()}.`
          : "Featured listings unlock homepage and category spotlight placement."}
      </p>
      {message ? <p className="text-xs text-destructive">{message}</p> : null}
    </div>
  );
}
