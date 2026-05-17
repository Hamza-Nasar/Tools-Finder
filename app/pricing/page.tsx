import Link from "next/link";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { getOptionalSession } from "@/lib/server-guards";
import { UserService } from "@/lib/services/user-service";
import { PageHero } from "@/components/shared/page-hero";
import { BillingActions } from "@/components/dashboard/billing-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Pricing Plans 2026: Free, Pro, and Vendor",
  description:
    "Compare Toolverse pricing plans: Free for discovery, Pro for advanced compare and alerts, Vendor for growth analytics and qualified buyer demand.",
  path: "/pricing",
  keywords: [
    "ai tools pricing",
    "pro plan",
    "vendor plan",
    "tool directory subscription",
    "ai tools platform pricing"
  ]
});

export default async function PricingPage() {
  const session = await getOptionalSession();
  const user = session?.user ? await UserService.syncSessionUser(session) : null;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Toolverse Pricing Plans",
        url: absoluteUrl("/pricing"),
        description:
          "Free, Pro, and Vendor plans for AI tool discovery, compare workflows, alerts, and growth analytics."
      },
      {
        "@type": "Product",
        name: "Toolverse Pro",
        description: "Advanced compare, shortlist workflows, and alerts for AI tool decisions.",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "19",
          highPrice: "190",
          offerCount: "2"
        }
      },
      {
        "@type": "Product",
        name: "Toolverse Vendor",
        description: "Vendor visibility, profile claim workflows, and growth analytics.",
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "99",
          highPrice: "990",
          offerCount: "2"
        }
      }
    ]
  };

  return (
    <div className="page-frame py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PageHero
        eyebrow="Pricing"
        title="Upgrade when your decisions and growth need more power."
        description="Free is for exploration. Pro is for faster tool decisions. Vendor is for founders who want qualified buyer demand and measurable growth."
      />
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card className="surface-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Free <Badge variant="muted">$0</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Best for casual discovery</p>
            <p>- Browse directory, categories, and public comparison pages</p>
            <p>- Basic finder recommendations</p>
            <p>- Limited shortlist saving, no live alerts, no vendor tools</p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/tools">Start free</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="surface-card-hover border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pro <Badge>$15/mo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Best for freelancers and teams deciding faster</p>
            <p>- Unlimited compare sessions and deeper recommendation confidence</p>
            <p>- Saved shortlists and reusable workflow stacks</p>
            <p>- Price/rank alerts + weekly digest</p>
            <p>- Better alternatives recommendations for every use case</p>
            <Button asChild className="mt-2 w-full">
              <Link href={user ? "/dashboard" : "/auth/login?callbackUrl=/pricing"}>{user ? "Manage Pro plan" : "Start Pro"}</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="surface-card-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Featured <Badge variant="accent">from $79/mo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Best for tool founders who want qualified traffic</p>
            <p>- Category and discovery surface placement</p>
            <p>- Featured badge + priority moderation</p>
            <p>- Vendor analytics, lead capture visibility, and claim workflows</p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/submit">Apply for featured listing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Why users upgrade to Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Less tool-hopping, faster shortlist decisions</p>
            <p>- Better confidence with compare + alerts</p>
            <p>- Saved decision history for repeat workflows</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Why founders choose Vendor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Visibility in high-intent discovery surfaces</p>
            <p>- Cleaner conversion path from listing to clicks</p>
            <p>- Revenue-focused positioning without spammy ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billing confidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Secure Stripe checkout</p>
            <p>- Plan updates automatically after successful payment</p>
            <p>- Admin revenue tracking records every paid event</p>
          </CardContent>
        </Card>
      </div>
      <div className="section-shell mt-8 p-6">
        {user ? (
          <>
            <p className="text-sm font-medium">Current plan: <span className="capitalize">{user.plan}</span></p>
            <div className="mt-4">
              <BillingActions currentPlan={user.plan} />
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">Sign in to start checkout, save shortlists, and manage your subscription.</p>
            <Button asChild>
              <Link href="/auth/login?callbackUrl=/pricing">Sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

