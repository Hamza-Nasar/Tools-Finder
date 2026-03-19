import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { PaymentService } from "@/lib/services/payment-service";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = buildMetadata({
  title: "Featured listing success",
  description: "Your featured listing purchase was processed successfully.",
  path: "/feature/success",
  noIndex: true
});

export default async function FeatureSuccessPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : undefined;
  const slug = typeof params.slug === "string" ? params.slug : undefined;

  if (!sessionId) {
    return (
      <div className="page-frame py-12">
        <EmptyState
          label="Missing"
          title="We could not verify this checkout session"
          description="Return to the tool page and start the featured checkout again."
          ctaHref={slug ? `/tools/${slug}` : "/tools"}
          ctaLabel="Back to listing"
        />
      </div>
    );
  }

  try {
    const result = await PaymentService.completeFeaturedCheckout(sessionId);

    return (
      <div className="page-frame py-12">
        <PageHero
          eyebrow="Featured active"
          title={`${result.tool.name} is now in premium placement.`}
          description="The listing is now eligible for homepage spotlight, top-of-category visibility, and highlighted placement across the directory."
          actions={
            <>
              <Button asChild>
                <Link href={`/tools/${result.tool.slug}`}>Open listing</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tools">Back to directory</Link>
              </Button>
            </>
          }
          stats={[
            {
              label: "Placement",
              value: "Featured",
              detail: "homepage and directory highlight treatment enabled"
            },
            {
              label: "Category",
              value: result.tool.categorySlug,
              detail: "category page visibility has been refreshed"
            },
            {
              label: "Checkout",
              value: "Paid",
              detail: "Stripe session completed successfully"
            }
          ]}
        />

        <Card className="mt-8 overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
            <CardTitle>What was activated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="surface-subtle flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="font-semibold">{result.tool.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.tool.tagline}</p>
              </div>
              <Badge variant="accent">Featured listing</Badge>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              Stripe checkout completed and the listing was immediately refreshed across the homepage,
              category page, tools directory, and admin revenue analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  } catch {
    return (
      <div className="page-frame py-12">
        <EmptyState
          label="Pending"
          title="Your payment is being finalized"
          description="The checkout session exists, but the listing is still waiting on final confirmation from Stripe. Refresh this page in a few seconds."
          ctaHref={slug ? `/tools/${slug}` : "/tools"}
          ctaLabel="Return to listing"
        />
      </div>
    );
  }
}
