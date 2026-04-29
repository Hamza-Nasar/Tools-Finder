import { buildMetadata } from "@/lib/seo";
import { featureFlags } from "@/lib/feature-flags";
import { RecommendationService } from "@/lib/services/recommendation-service";
import { TelemetryService } from "@/lib/services/telemetry-service";
import { AiToolFinder } from "@/components/tools/ai-tool-finder";
import { PageHero } from "@/components/shared/page-hero";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "AI Tool Finder 2026: Get Recommendations from Your Workflow",
  description:
    "Use the AI tool finder to describe your task in plain language and get ranked AI tool recommendations matched by categories, tags, and workflow intent.",
  path: "/find-ai-tool",
  keywords: [
    "ai tool finder",
    "ai tool recommender",
    "find ai tools",
    "ai tools by workflow",
    "best ai tools for my task"
  ]
});

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FindAiToolPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = firstValue(resolvedSearchParams.q)?.trim() ?? "";
  const recommendations =
    query.length >= 3
      ? await RecommendationService.recommendTools(query, 6)
      : {
          query,
          inferredCategories: [],
          inferredTags: [],
          tools: []
        };

  if (featureFlags.finderTelemetry && query.length >= 3) {
    try {
      await TelemetryService.recordEvent({
        eventType: "finder_search",
        path: "/find-ai-tool",
        query,
        metadata: {
          inferredCategories: recommendations.inferredCategories.length,
          inferredTags: recommendations.inferredTags.length,
          resultCount: recommendations.tools.length
        }
      });
    } catch {
      // Keep the finder resilient if telemetry fails.
    }
  }

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="AI tool finder"
        title="Describe the job. Get the right tool."
        description="Turn a vague problem statement into a ranked shortlist. The recommender blends search, category inference, and tag overlap to surface relevant tools fast."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="#finder-workspace">
                Find my tool
                <Search data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tools">
                Browse categories
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </Button>
          </>
        }
        stats={[
          { label: "Input style", value: "Natural language", detail: "describe the problem instead of guessing filters" },
          { label: "Signals", value: "Category + tags", detail: "recommendations use existing directory metadata" }
        ]}
      />

      <div id="finder-workspace" className="mt-10 scroll-mt-28">
        <AiToolFinder
          query={recommendations.query}
          recommendations={recommendations.tools}
          inferredCategories={recommendations.inferredCategories}
          inferredTags={recommendations.inferredTags}
        />
      </div>
    </div>
  );
}

