import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getOptionalSession } from "@/lib/server-guards";
import { UserService } from "@/lib/services/user-service";
import { PageHero } from "@/components/shared/page-hero";
import { BillingActions } from "@/components/dashboard/billing-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Pricing",
  description: "Choose Free, Pro, or Vendor plan for advanced compare, alerts, and vendor growth features.",
  path: "/pricing"
});

export default async function PricingPage() {
  const session = await getOptionalSession();
  const user = session?.user ? await UserService.syncSessionUser(session) : null;

  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="Pricing"
        title="Scale from discovery to revenue."
        description="Start free, upgrade for advanced compare and alerts, then unlock vendor growth tools."
      />
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free <Badge variant="muted">$0</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Basic discovery and directory browsing</p>
            <p>Starter recommendations</p>
            <p>Tool pages and comparisons</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pro <Badge>$19/mo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Advanced recommendation depth</p>
            <p>Saved workflow stacks</p>
            <p>Workflow alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Vendor <Badge variant="accent">$99/mo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Claim tool profiles</p>
            <p>Vendor analytics + lead capture</p>
            <p>Priority growth workflows</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 rounded-[1.2rem] border border-border/70 bg-background/50 p-6">
        {user ? (
          <>
            <p className="text-sm font-medium">Current plan: <span className="capitalize">{user.plan}</span></p>
            <div className="mt-4">
              <BillingActions currentPlan={user.plan} />
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">Sign in to start checkout and manage subscriptions.</p>
            <Button asChild>
              <Link href="/auth/login?callbackUrl=/pricing">Sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
