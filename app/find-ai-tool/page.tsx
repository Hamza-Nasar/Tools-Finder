import { buildMetadata } from "@/lib/seo";
import { RecommendationService } from "@/lib/services/recommendation-service";
import { AiToolFinder } from "@/components/tools/ai-tool-finder";
import { PageHero } from "@/components/shared/page-hero";

export const metadata = buildMetadata({
  title: "Find the Right AI Tool",
  description: "Describe your workflow in plain language and get AI tool recommendations matched to categories and tags.",
  path: "/find-ai-tool",
  keywords: ["ai tool finder", "ai recommender", "find ai tools"]
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

  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="AI tool finder"
        title="Describe the job. Get the right tool."
        description="Turn a vague problem statement into a ranked shortlist. The recommender blends search, category inference, and tag overlap to surface relevant tools fast."
        stats={[
          { label: "Input style", value: "Natural language", detail: "describe the problem instead of guessing filters" },
          { label: "Signals", value: "Category + tags", detail: "recommendations use existing directory metadata" }
        ]}
      />

      <div className="mt-10">
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
