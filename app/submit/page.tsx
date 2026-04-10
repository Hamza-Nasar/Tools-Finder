import Link from "next/link";
import { getPublicCategories } from "@/lib/data/categories";
import { getDefaultPaidListingPlan, getListingPlans } from "@/lib/listing-plans";
import { hasOpenAIConfig } from "@/lib/openai";
import { buildMetadata } from "@/lib/seo";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { ToolSubmissionForm } from "@/components/forms/tool-submission-form";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Submit an AI Tool",
  description: "Submit a new AI tool for moderation and listing in the AI Tools Finder directory.",
  path: "/submit"
});

export default async function SubmitToolPage() {
  await requireAuthenticatedSession();
  const categories = await getPublicCategories();
  const featuredOffer = getDefaultPaidListingPlan();
  const listingPlans = getListingPlans();
  const aiAssistantEnabled = hasOpenAIConfig();

  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="Submit"
        title="Pitch a tool for inclusion in the directory."
        description="Share the product, workflow, and category fit. Every submission is reviewed before it appears publicly, and approved listings can later upgrade into paid featured placement."
        stats={[
          { label: "Review flow", value: "Moderated", detail: "new tools enter a pending queue" },
          { label: "Categories", value: String(categories.length), detail: "available workflow lanes" },
          { label: "Featured offer", value: featuredOffer.priceLabel, detail: `premium placement for ${featuredOffer.durationLabel}` }
        ]}
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">What happens next</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Each submission enters a moderation queue before going live.</li>
              <li>Admins may refine your copy, tags, or category to keep search quality high.</li>
              <li>Approved tools stay live on the free plan and can upgrade into paid placement later.</li>
            </ul>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Submission tips</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Use a tagline that explains the primary workflow, not just the brand.</li>
              <li>Choose the closest category and 3-6 specific tags.</li>
              <li>Add clean screenshot URLs so the listing feels complete on approval.</li>
            </ul>
          </div>
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Paid growth option</p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Approved tools stay listed for free, and can later upgrade into paid plans starting at {featuredOffer.summaryLabel}.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {listingPlans.map((plan) => (
                <li key={plan.id}>
                  {plan.name}: {plan.summaryLabel}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/feature-your-tool">See founder pricing</Link>
            </Button>
          </div>
        </div>
        <div>
          <ToolSubmissionForm categories={categories} aiAssistantEnabled={aiAssistantEnabled} />
        </div>
      </div>
    </div>
  );
}
