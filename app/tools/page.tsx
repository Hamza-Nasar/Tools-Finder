import dynamic from "next/dynamic";
import Link from "next/link";
import { getPublicCategories } from "@/lib/data/categories";
import { getPublicToolList, getToolDirectoryFacets } from "@/lib/data/tools";
import { pricingOptions, skillLevelOptions, toolOutputTypeOptions, toolPlatformOptions } from "@/lib/constants";
import { featureFlags } from "@/lib/feature-flags";
import { buildMetadata } from "@/lib/seo";
import { searchSiteContent } from "@/lib/site-search";
import { TelemetryService } from "@/lib/services/telemetry-service";
import { compactNumber } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SiteSearchResults } from "@/components/tools/site-search-results";
import { ToolCard } from "@/components/tools/tool-card";
import { ToolFilters } from "@/components/tools/tool-filters";

const HybridDiscoveryPanel = dynamic(
  () => import("@/components/tools/hybrid-discovery-panel").then((module) => module.HybridDiscoveryPanel),
  {
    loading: () => (
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
    )
  }
);

export const metadata = buildMetadata({
  title: "AI Tools Directory 2026: Compare, Filter, and Discover Better Tools",
  description:
    "Browse the AI tools directory with workflow filters, category discovery, tags, pricing, and popularity ranking to find better tools faster.",
  path: "/tools",
  keywords: [
    "ai tools directory",
    "compare ai tools",
    "ai software list",
    "ai tools by category",
    "best ai tools 2026"
  ]
});

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

function toBoolean(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return value === "true";
}

function normalizeSort(value: string | undefined) {
  if (value === "featured" || value === "favorited" || value === "popular") {
    return value;
  }

  if (value === "latest") {
    return "newest";
  }

  return "newest";
}

function normalizePricing(value: string | undefined) {
  if (!value || !pricingOptions.includes(value as (typeof pricingOptions)[number])) {
    return undefined;
  }

  return value as (typeof pricingOptions)[number];
}

function normalizeSkillLevel(value: string | undefined) {
  if (!value || !skillLevelOptions.includes(value as (typeof skillLevelOptions)[number])) {
    return undefined;
  }

  return value as (typeof skillLevelOptions)[number];
}

export default async function ToolsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = toPositiveInt(firstValue(resolvedSearchParams.page), 1);
  const limit = toPositiveInt(firstValue(resolvedSearchParams.limit), 12);
  const rawTags = firstValue(resolvedSearchParams.tags) ?? firstValue(resolvedSearchParams.tag);
  const tags = rawTags
    ?.split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const platforms = firstValue(resolvedSearchParams.platforms)
    ?.split(",")
    .map((value) => value.trim())
    .filter((value): value is (typeof toolPlatformOptions)[number] =>
      toolPlatformOptions.includes(value as (typeof toolPlatformOptions)[number])
    );
  const outputTypes = firstValue(resolvedSearchParams.outputTypes)
    ?.split(",")
    .map((value) => value.trim())
    .filter((value): value is (typeof toolOutputTypeOptions)[number] =>
      toolOutputTypeOptions.includes(value as (typeof toolOutputTypeOptions)[number])
    );
  const query = {
    q: firstValue(resolvedSearchParams.q),
    category: firstValue(resolvedSearchParams.category),
    tags,
    pricing: normalizePricing(firstValue(resolvedSearchParams.pricing)),
    loginRequired: toBoolean(firstValue(resolvedSearchParams.loginRequired)),
    skillLevel: normalizeSkillLevel(firstValue(resolvedSearchParams.skillLevel)),
    platforms,
    outputTypes,
    featured: toBoolean(firstValue(resolvedSearchParams.featured)),
    recent: toBoolean(firstValue(resolvedSearchParams.recent)),
    sort: normalizeSort(firstValue(resolvedSearchParams.sort)),
    page,
    limit
  } as const;
  const [categories, facets, tools] = await Promise.all([
    getPublicCategories(),
    getToolDirectoryFacets(),
    getPublicToolList(query)
  ]);
  const hasHybridSearch = Boolean(query.q?.trim() && query.q.trim().length >= 2);
  const siteResults = hasHybridSearch ? searchSiteContent(query.q ?? "", 6) : [];

  if (featureFlags.toolsSearchTelemetry && query.q?.trim()) {
    try {
      await TelemetryService.recordEvent({
        eventType: "tools_search",
        path: "/tools",
        query: query.q.trim(),
        metadata: {
          category: query.category ?? null,
          pricing: query.pricing ?? null,
          hasTags: Boolean(query.tags?.length)
        }
      });
    } catch {
      // Do not block page rendering on telemetry failures.
    }
  }

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();

    if (query.q) params.set("q", query.q);
    if (query.category) params.set("category", query.category);
    if (query.tags?.length) params.set("tags", query.tags.join(","));
    if (query.pricing) params.set("pricing", query.pricing);
    if (query.loginRequired !== undefined) params.set("loginRequired", String(query.loginRequired));
    if (query.skillLevel) params.set("skillLevel", query.skillLevel);
    if (query.platforms?.length) params.set("platforms", query.platforms.join(","));
    if (query.outputTypes?.length) params.set("outputTypes", query.outputTypes.join(","));
    if (query.featured) params.set("featured", "true");
    if (query.recent) params.set("recent", "true");
    if (query.sort) params.set("sort", query.sort);
    params.set("page", String(nextPage));
    params.set("limit", String(limit));

    return `/tools?${params.toString()}`;
  }

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Directory"
        title="Find and compare the right tools."
        description="Explore the catalog with modern filters, shareable URLs, and pagination built for deep browsing instead of endless scrolling."
        stats={[
          { label: "Results", value: compactNumber(tools.total), detail: "matched for the current filter set" },
          { label: "Categories", value: compactNumber(categories.length), detail: "entry points into the catalog" },
          {
            label: "Sort mode",
            value:
              query.sort === "popular"
                ? "Popular"
                : query.sort === "favorited"
                  ? "Favorited"
                  : query.sort === "featured"
                    ? "Featured"
                    : "Newest",
            detail: "adjust ranking instantly"
          }
        ]}
      />

      <div className="mt-8">
        <ToolFilters categories={categories} topTags={facets.topTags} resultCount={tools.total} />
      </div>

      {hasHybridSearch ? (
        <>
          <div className="mt-8">
            <SiteSearchResults query={query.q ?? ""} results={siteResults} />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Overall search checks site pages, the local MongoDB catalog, and external discovery sources.
            </p>
            <p className="text-sm text-muted-foreground">
              MongoDB matched {tools.total} local tool(s); web results stream in without blocking the page.
            </p>
          </div>
          <div className="mt-4">
            <HybridDiscoveryPanel
              query={query.q ?? ""}
              localTools={tools.data}
              localTotal={tools.total}
              category={query.category}
              pricing={query.pricing}
              tags={query.tags}
              sort={query.sort}
              featured={query.featured}
              recent={query.recent}
              limit={Math.min(limit, 8)}
            />
          </div>
          {tools.totalPages > 1 ? (
            <PaginationControls page={tools.page} totalPages={tools.totalPages} buildHref={buildHref} />
          ) : null}
        </>
      ) : tools.data.length ? (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing page {tools.page} of {tools.totalPages}. {tools.total} tools matched your current filters.
            </p>
            <p className="text-sm text-muted-foreground">
              Search runs against indexed catalog fields and keeps this URL shareable.
            </p>
          </div>
          {featureFlags.comparePreview && tools.data.length >= 2 ? (
            <div className="mt-4 section-shell p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Compare before choosing</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start side-by-side evaluation instead of opening each tool in separate tabs.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/compare/${tools.data[0].slug}-vs-${tools.data[1].slug}`}
                  className="inline-flex items-center rounded-[var(--radius-control)] border border-border bg-white/85 px-4 py-2 text-sm font-medium text-foreground hover:bg-white"
                >
                  Compare {tools.data[0].name} vs {tools.data[1].name}
                </Link>
              </div>
            </div>
          ) : null}
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tools.data.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                matchReason={
                  query.q?.trim()
                    ? `Matched for "${query.q.trim()}"`
                    : query.tags?.length
                      ? `Matches selected tags: ${query.tags.slice(0, 2).join(", ")}`
                      : query.category
                        ? `In category: ${query.category}`
                        : undefined
                }
              />
            ))}
          </div>
          <PaginationControls page={tools.page} totalPages={tools.totalPages} buildHref={buildHref} />
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No tools matched this search"
            description="Try a broader keyword, remove a tag filter, or switch to another category."
            ctaHref="/tools"
            ctaLabel="Reset filters"
          />
        </div>
      )}
    </div>
  );
}

