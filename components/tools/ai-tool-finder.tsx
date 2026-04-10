import Link from "next/link";
import type { FinderAssistantInsight, ToolRecommendation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { ToolCard } from "@/components/tools/tool-card";

export function AiToolFinder({
  query,
  recommendations,
  inferredCategories,
  inferredTags,
  aiInsight
}: {
  query: string;
  recommendations: ToolRecommendation[];
  inferredCategories: string[];
  inferredTags: string[];
  aiInsight: FinderAssistantInsight | null;
}) {
  const exampleQueries = [
    "I need an AI tool for YouTube thumbnails",
    "Help me find an AI coding assistant for debugging",
    "What AI tool should I use for research summaries?"
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="border-b border-border/70">
          <CardTitle>Describe the problem</CardTitle>
          <CardDescription>
            Tell the finder what you need in plain language. It will infer categories, tags, and relevant tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <form action="/find-ai-tool" method="get" className="space-y-4">
            <Textarea
              name="q"
              defaultValue={query}
              placeholder="I need an AI tool for YouTube thumbnails"
              aria-label="Describe the kind of AI tool you need"
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Find tools</Button>
              <Button asChild type="button" variant="outline">
                <Link href="/tools">Browse manually</Link>
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((example) => (
              <Link
                key={example}
                href={`/find-ai-tool?q=${encodeURIComponent(example)}`}
                className="rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white hover:text-foreground"
              >
                {example}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {query.trim().length >= 3 ? (
        <>
          {aiInsight ? (
            <Card className="overflow-hidden">
              <CardHeader className="hero-mesh border-b border-border/70">
                <CardTitle>AI search read</CardTitle>
                <CardDescription>{aiInsight.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.1rem] border border-border/70 bg-white/75 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-primary">Ideal user</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{aiInsight.idealUser}</p>
                  </div>
                  <div className="rounded-[1.1rem] border border-border/70 bg-white/75 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-primary">Budget read</p>
                    <p className="mt-2 text-sm font-medium capitalize text-foreground">{aiInsight.budgetPreference}</p>
                  </div>
                  <div className="rounded-[1.1rem] border border-border/70 bg-white/75 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-primary">Evaluation criteria</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {aiInsight.evaluationCriteria.slice(0, 2).join(", ")}
                    </p>
                  </div>
                </div>

                {aiInsight.followUpQueries.length ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Try these next queries</p>
                    <div className="flex flex-wrap gap-2">
                      {aiInsight.followUpQueries.map((item) => (
                        <Link
                          key={item}
                          href={`/find-ai-tool?q=${encodeURIComponent(item)}`}
                          className="rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-white hover:text-foreground"
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">Inference signals:</p>
            {inferredCategories.map((category) => (
              <Badge key={category} variant="muted">
                {category}
              </Badge>
            ))}
            {inferredTags.map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
          </div>

          {recommendations.length ? (
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((recommendation) => (
                <div key={recommendation.tool.id} className="space-y-3">
                  <ToolCard tool={recommendation.tool} />
                  <div className="rounded-[1.25rem] border border-border/70 bg-white/75 px-4 py-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Why it fits:</span> {recommendation.reason}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              label="Finder"
              title="No strong matches yet"
              description="Try a clearer use case, mention the workflow, or add constraints like free, coding, marketing, or research."
              ctaHref="/tools"
              ctaLabel="Browse the directory"
            />
          )}
        </>
      ) : (
        <EmptyState
          label="Finder"
          title="Describe your workflow to get recommendations"
          description="The finder works best when you explain the use case in one or two sentences instead of searching with just a single keyword."
          ctaHref="/tools"
          ctaLabel="Explore all tools"
        />
      )}
    </div>
  );
}
