import { getPublicCategories } from "@/lib/data/categories";
import { buildMetadata } from "@/lib/seo";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { ToolSubmissionForm } from "@/components/forms/tool-submission-form";
import { PageHero } from "@/components/shared/page-hero";

export const metadata = buildMetadata({
  title: "Submit an AI Tool",
  description: "Submit a new AI tool for moderation and listing in the AI Tools Finder discovery engine.",
  path: "/submit"
});

export default async function SubmitToolPage() {
  await requireAuthenticatedSession();
  const categories = await getPublicCategories();

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Submit"
        title="Submit your tool for premium review."
        description="Share the product, workflow, and category fit. Every submission is reviewed before it appears publicly."
        stats={[
          { label: "Review flow", value: "Moderated", detail: "new tools enter a pending queue" },
          { label: "Categories", value: String(categories.length), detail: "available workflow lanes" },
          { label: "Listing state", value: "Premium", detail: "approved entries feed the discovery engine" }
        ]}
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">What happens next</p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Each submission enters a moderation queue before going live.</li>
              <li>Admins may refine your copy, tags, or category to keep search quality high.</li>
              <li>Approved tools become eligible for trending and featured placement later.</li>
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
        </div>
        <div>
          <ToolSubmissionForm categories={categories} />
        </div>
      </div>
    </div>
  );
}

