"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { safeApiRequest } from "@/lib/client-api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

      toast.success("Redirecting to secure Stripe checkout...");
      window.location.href = checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected billing error.";
      toast.error(message);
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--radius-control)] border border-border/70 bg-white/90 p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Secure Stripe checkout. Plan updates automatically after successful payment.
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={currentPlan === "pro" ? "accent" : "muted"}>Pro: alerts + unlimited compare</Badge>
          <Badge variant={currentPlan === "vendor" ? "accent" : "muted"}>Vendor: claims + growth tools</Badge>
        </div>
      </div>
      <Tabs defaultValue={currentPlan === "vendor" ? "vendor" : "pro"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pro">Pro plan</TabsTrigger>
          <TabsTrigger value="vendor">Vendor plan</TabsTrigger>
        </TabsList>
        <TabsContent value="pro" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">For power users and teams</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                disabled={currentPlan === "pro" || loadingKey !== null}
                onClick={() => void startCheckout("pro", "monthly")}
              >
                {loadingKey === "pro:monthly" ? "Redirecting..." : "Pro Monthly ($19)"}
              </Button>
              <Button
                variant="outline"
                disabled={currentPlan === "pro" || loadingKey !== null}
                onClick={() => void startCheckout("pro", "yearly")}
              >
                {loadingKey === "pro:yearly" ? "Redirecting..." : "Pro Yearly ($190)"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vendor" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">For founders and vendors</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Button
                disabled={currentPlan === "vendor" || loadingKey !== null}
                onClick={() => void startCheckout("vendor", "monthly")}
              >
                {loadingKey === "vendor:monthly" ? "Redirecting..." : "Vendor Monthly ($99)"}
              </Button>
              <Button
                disabled={currentPlan === "vendor" || loadingKey !== null}
                onClick={() => void startCheckout("vendor", "yearly")}
              >
                {loadingKey === "vendor:yearly" ? "Redirecting..." : "Vendor Yearly ($990)"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
