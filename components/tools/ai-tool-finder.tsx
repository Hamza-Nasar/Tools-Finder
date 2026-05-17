"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowUpRight, Lightbulb, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { ToolRecommendation } from "@/types";
import { saveFinderShortlistAction } from "@/lib/actions/shortlist-actions";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Kbd } from "@/components/ui/kbd";
import { Item } from "@/components/ui/item";
import { EmptyState } from "@/components/shared/empty-state";
import { ToolCard } from "@/components/tools/tool-card";

export function AiToolFinder({
  query,
  recommendations,
  inferredCategories,
  inferredTags
}: {
  query: string;
  recommendations: ToolRecommendation[];
  inferredCategories: string[];
  inferredTags: string[];
}) {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [sharePath, setSharePath] = useState<string | null>(null);
  const [isSavingShortlist, startSavingShortlist] = useTransition();

  const confidenceLabel = useMemo(() => {
    if (recommendations.length >= 4 && inferredCategories.length >= 1 && inferredTags.length >= 2) {
      return "High confidence";
    }

    if (recommendations.length >= 2) {
      return "Medium confidence";
    }

    return "Low confidence";
  }, [recommendations.length, inferredCategories.length, inferredTags.length]);
  const confidenceValue = confidenceLabel === "High confidence" ? 86 : confidenceLabel === "Medium confidence" ? 58 : 30;

  const exampleQueries = [
    "I need an AI tool for YouTube thumbnails",
    "Help me find an AI coding assistant for debugging",
    "What AI tool should I use for research summaries?"
  ];

  function saveShortlist() {
    startSavingShortlist(async () => {
      if (!query.trim() || !recommendations.length) {
        setSaveMessage("Run a query first, then save the shortlist.");
        return;
      }

      const result = await saveFinderShortlistAction({
        query: query.trim(),
        toolIds: recommendations.map((item) => item.tool.id),
        inferredCategories,
        inferredTags
      });

      if (result.status === "success" && result.data?.sharePath) {
        setSharePath(result.data.sharePath);
        setSaveMessage("Shortlist saved to your account.");
        toast.success("Shortlist saved", {
          description: "You can open and share it from your account."
        });
      } else {
        setSaveMessage(result.message ?? "Unable to save shortlist. Please sign in and retry.");
        toast.error("Unable to save shortlist", {
          description: result.message ?? "Please sign in and try again."
        });
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <MotionReveal y={20}>
        <Card className="overflow-hidden border-white/75 bg-white/[0.88] shadow-premium">
          <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge variant="muted" className="w-fit bg-white/80">
                  Intent input
                </Badge>
                <CardTitle className="mt-3">Describe the problem</CardTitle>
                <CardDescription className="mt-2 max-w-2xl">
                  Tell the finder what you need in plain language. It will infer categories, tags, and relevant tools.
                </CardDescription>
              </div>
              <Alert variant="muted" className="max-w-sm shadow-sm">
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>mention output, budget, and workflow.</AlertDescription>
              </Alert>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-6">
            <form action="/find-ai-tool" method="get" className="flex flex-col gap-4">
              <Textarea
                name="q"
                defaultValue={query}
                placeholder="I need an AI tool for YouTube thumbnails"
                aria-label="Describe the kind of AI tool you need"
                className="min-h-[12rem] resize-none text-base leading-7"
              />
              <div className="flex flex-wrap gap-3">
                <Button type="submit">
                  <Search data-icon="inline-start" />
                  Get recommendations
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/tools">
                    Browse categories
                    <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </form>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Try a workflow
              </p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <MotionReveal key={example} delay={index * 0.04} y={8} className="inline-flex">
                    <Link
                      href={`/find-ai-tool?q=${encodeURIComponent(example)}`}
                      className="interactive-chip rounded-full border border-border bg-white/80 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white hover:text-foreground"
                    >
                      <Item className="border-0 bg-transparent p-0">
                        <span className="line-clamp-1">{example}</span>
                        <Kbd>↵</Kbd>
                      </Item>
                    </Link>
                  </MotionReveal>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionReveal>

      {query.trim().length >= 3 ? (
        <>
          <MotionReveal className="flex flex-wrap items-center gap-3" y={14}>
            <Badge variant="accent" className="gap-2">
              <Sparkles data-icon="inline-start" />
              Inference signals
            </Badge>
            <Badge variant="muted">{confidenceLabel}</Badge>
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
          </MotionReveal>
          <div className="max-w-md space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Confidence progression</Label>
              <span className="text-xs font-medium text-foreground">{confidenceValue}%</span>
            </div>
            <Progress value={confidenceValue} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={saveShortlist} disabled={isSavingShortlist}>
              {isSavingShortlist ? "Saving..." : "Save this shortlist"}
            </Button>
            {saveMessage ? (
              <Alert variant="muted" className="w-auto">
                <AlertDescription>{saveMessage}</AlertDescription>
              </Alert>
            ) : null}
            {sharePath ? (
              <Link href={sharePath} className="text-sm font-medium text-primary">
                Open shared shortlist
              </Link>
            ) : null}
          </div>

          {recommendations.length ? (
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((recommendation, index) => (
                <MotionReveal
                  key={recommendation.tool.id}
                  className="flex h-full flex-col gap-3"
                  delay={index * 0.05}
                  y={18}
                >
                  <ToolCard tool={recommendation.tool} />
                  <Card className="surface-card-hover border-white/75 bg-white/[0.82]">
                    <CardHeader className="flex flex-row items-start gap-3 border-b border-border/60 px-4 py-4">
                      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Lightbulb className="size-4" aria-hidden="true" />
                      </div>
                      <div>
                        <CardTitle className="text-base md:text-base">Why it fits</CardTitle>
                        <CardDescription className="mt-1">
                          Score {Math.max(Math.round(recommendation.score), 1)} based on category, tag, and text match.
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 py-4">
                      <p className="text-sm leading-6 text-muted-foreground">{recommendation.reason}</p>
                    </CardContent>
                    <CardFooter className="flex-wrap gap-2 px-4 pb-4 pt-0">
                      {recommendation.matchedCategories.map((category) => (
                        <Badge key={category} variant="muted">
                          {category}
                        </Badge>
                      ))}
                      {recommendation.matchedTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="muted">
                          {tag}
                        </Badge>
                      ))}
                    </CardFooter>
                  </Card>
                </MotionReveal>
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
