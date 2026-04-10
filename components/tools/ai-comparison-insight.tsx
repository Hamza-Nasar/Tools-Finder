"use client";

import { useEffect, useState } from "react";
import type { ComparisonAssistantInsight, Tool } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ComparisonSnapshot = Pick<
  Tool,
  | "name"
  | "tagline"
  | "description"
  | "category"
  | "categorySlug"
  | "tags"
  | "pricing"
  | "rating"
  | "reviewCount"
  | "favoritesCount"
  | "viewsCount"
  | "trendingScore"
>;

function serializeTool(tool: Tool): ComparisonSnapshot {
  return {
    name: tool.name,
    tagline: tool.tagline,
    description: tool.description,
    category: tool.category,
    categorySlug: tool.categorySlug,
    tags: tool.tags,
    pricing: tool.pricing,
    rating: tool.rating,
    reviewCount: tool.reviewCount,
    favoritesCount: tool.favoritesCount,
    viewsCount: tool.viewsCount,
    trendingScore: tool.trendingScore
  };
}

export function AiComparisonInsight({
  toolA,
  toolB,
  enabled
}: {
  toolA: Tool;
  toolB: Tool;
  enabled: boolean;
}) {
  const [state, setState] = useState<{
    insight: ComparisonAssistantInsight | null;
    error: string | null;
    loading: boolean;
  }>({
    insight: null,
    error: null,
    loading: enabled
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        insight: null,
        error: null,
        loading: false
      });
      return;
    }

    let ignore = false;

    void (async () => {
      try {
        setState((current) => ({
          ...current,
          loading: true,
          error: null
        }));

        const response = await fetch("/api/ai/comparison", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            toolA: serializeTool(toolA),
            toolB: serializeTool(toolB)
          })
        });
        const payload = (await response.json()) as {
          data?: ComparisonAssistantInsight;
          error?: string;
        };

        if (!response.ok || !payload.data) {
          throw new Error(payload.error ?? "Unable to load the AI comparison.");
        }

        if (!ignore) {
          setState({
            insight: payload.data,
            error: null,
            loading: false
          });
        }
      } catch (error) {
        if (!ignore) {
          setState({
            insight: null,
            error: error instanceof Error ? error.message : "Unable to load the AI comparison.",
            loading: false
          });
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [enabled, toolA, toolB]);

  if (!enabled) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="hero-mesh border-b border-border/70">
        <CardTitle>AI buyer read</CardTitle>
        <CardDescription>
          {state.insight?.headline ?? "A concise AI summary focused on fit, tradeoffs, and likely buyer use cases."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {state.loading ? <p className="text-sm text-muted-foreground">Generating AI comparison...</p> : null}
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

        {state.insight ? (
          <>
            <p className="text-sm leading-7 text-muted-foreground">{state.insight.verdict}</p>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[1.25rem] border border-border/70 bg-white/75 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Choose {toolA.name} for</p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                  {state.insight.chooseToolAFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.25rem] border border-border/70 bg-white/75 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Choose {toolB.name} for</p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                  {state.insight.chooseToolBFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
