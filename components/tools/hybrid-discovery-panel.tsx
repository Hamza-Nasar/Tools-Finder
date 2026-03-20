"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { HybridSearchWebPayload, PricingTier, Tool, ToolSort, WebDiscoveredTool } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { ToolCard } from "@/components/tools/tool-card";
import { DiscoveredToolCard } from "@/components/tools/discovered-tool-card";

interface HybridDiscoveryPanelProps {
  query: string;
  localTools: Tool[];
  localTotal: number;
  category?: string;
  pricing?: PricingTier;
  tags?: string[];
  sort?: ToolSort;
  featured?: boolean;
  recent?: boolean;
  limit: number;
}

function buildSearchUrl(input: {
  query: string;
  category?: string;
  pricing?: PricingTier;
  tags?: string[];
  sort?: ToolSort;
  featured?: boolean;
  recent?: boolean;
  limit: number;
}) {
  const params = new URLSearchParams();
  params.set("q", input.query);

  if (input.category) params.set("category", input.category);
  if (input.pricing) params.set("pricing", input.pricing);
  if (input.tags?.length) params.set("tags", input.tags.join(","));
  if (input.sort) params.set("sort", input.sort);
  if (input.featured) params.set("featured", "true");
  if (input.recent) params.set("recent", "true");
  params.set("limit", String(input.limit));

  return `/api/tools/search?${params.toString()}`;
}

export function HybridDiscoveryPanel({
  query,
  localTools,
  localTotal,
  category,
  pricing,
  tags,
  sort,
  featured,
  recent,
  limit
}: HybridDiscoveryPanelProps) {
  const router = useRouter();
  const [webPayload, setWebPayload] = useState<HybridSearchWebPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedSlugs, setImportedSlugs] = useState<Record<string, string>>({});

  const searchUrl = useMemo(
    () =>
      buildSearchUrl({
        query,
        category,
        pricing,
        tags,
        sort,
        featured,
        recent,
        limit
      }),
    [category, featured, limit, pricing, query, recent, sort, tags]
  );

  useEffect(() => {
    setWebPayload(null);
    setStatus("loading");

    const source = new EventSource(searchUrl);

    source.addEventListener("web", (event) => {
      const payload = JSON.parse(event.data) as HybridSearchWebPayload;
      setWebPayload(payload);
      setStatus("ready");
    });

    source.addEventListener("error", () => {
      setStatus("error");
      source.close();
    });

    source.addEventListener("complete", () => {
      source.close();
    });

    return () => {
      source.close();
    };
  }, [searchUrl]);

  async function handleImport(tool: WebDiscoveredTool) {
    try {
      setImportingId(tool.id);

      const response = await fetch("/api/tools/search/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: tool.id,
          provider: tool.provider,
          name: tool.name,
          tagline: tool.tagline,
          description: tool.description,
          website: tool.website,
          category: tool.category,
          categorySlug: tool.categorySlug,
          tags: tool.tags,
          pricing: tool.pricing,
          logo: tool.logo ?? null,
          directoryUrl: tool.directoryUrl ?? null
        })
      });

      if (!response.ok) {
        throw new Error("Import failed.");
      }

      const payload = (await response.json()) as { data?: { tool?: Tool } };
      const slug = payload.data?.tool?.slug;

      if (!slug) {
        throw new Error("Imported tool slug missing.");
      }

      setImportedSlugs((current) => ({
        ...current,
        [tool.id]: slug
      }));
      router.push(`/tools/${slug}`);
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <SectionHeading
          eyebrow="Local Tools"
          title="Results from your MongoDB catalog"
          description="These matches are already indexed locally, moderated, and ready to browse without any external fetch."
        />
        {localTools.length ? (
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {localTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              label="Local"
              title="No local matches yet"
              description={`Nothing in the local database matched "${query}". Web discovery is still running below.`}
            />
          </div>
        )}
        <p className="mt-4 text-sm text-muted-foreground">{localTotal} local result(s) matched this search.</p>
      </section>

      <section>
        <SectionHeading
          eyebrow="Discovered on the Web"
          title="Live matches from external AI tool sources"
          description="These results are fetched from Futurepedia, GitHub, There's An AI For That, and Product Hunt when available."
        />

        {status === "loading" ? (
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="surface-card p-6">
                <div className="skeleton-shimmer h-12 w-12 rounded-2xl" />
                <div className="mt-4 skeleton-shimmer h-5 w-2/3 rounded-full" />
                <div className="mt-3 skeleton-shimmer h-4 w-full rounded-full" />
                <div className="mt-2 skeleton-shimmer h-4 w-5/6 rounded-full" />
                <div className="mt-6 skeleton-shimmer h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : null}

        {status === "ready" && webPayload?.results.length ? (
          <>
            <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {webPayload.results.map((tool) => (
                <DiscoveredToolCard
                  key={tool.id}
                  tool={tool}
                  importing={importingId === tool.id}
                  importedToolSlug={importedSlugs[tool.id] ?? tool.importedToolSlug ?? null}
                  onImport={handleImport}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {webPayload.providers.map((provider) => (
                <span key={provider.provider} className="rounded-full border border-border bg-white/70 px-3 py-1">
                  {provider.provider}: {provider.count}
                  {provider.cached ? " cached" : ""}
                </span>
              ))}
            </div>
          </>
        ) : null}

        {status === "ready" && !webPayload?.results.length ? (
          <div className="mt-4">
            <EmptyState
              label="Web"
              title="No external matches surfaced"
              description={`No additional web results were found for "${query}" after deduping against your local directory.`}
            />
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-4">
            <EmptyState
              label="Web"
              title="External discovery is temporarily unavailable"
              description="Local results are still usable. Retry the search in a moment to fetch fresh web matches."
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
