import { getPublicCategories } from "@/lib/data/categories";
import { getPublicToolList, getToolDirectoryFacets } from "@/lib/data/tools";
import { pricingOptions } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import { compactNumber } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { HybridDiscoveryPanel } from "@/components/tools/hybrid-discovery-panel";
import { ToolCard } from "@/components/tools/tool-card";
import { ToolFilters } from "@/components/tools/tool-filters";

export const metadata = buildMetadata({
  title: "AI Tools Directory",
  description: "Search, filter, and browse the AI tools directory by category, tag, and popularity.",
  path: "/tools"
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
  const query = {
    q: firstValue(resolvedSearchParams.q),
    category: firstValue(resolvedSearchParams.category),
    tags,
    pricing: normalizePricing(firstValue(resolvedSearchParams.pricing)),
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

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();

    if (query.q) params.set("q", query.q);
    if (query.category) params.set("category", query.category);
    if (query.tags?.length) params.set("tags", query.tags.join(","));
    if (query.pricing) params.set("pricing", query.pricing);
    if (query.featured) params.set("featured", "true");
    if (query.recent) params.set("recent", "true");
    if (query.sort) params.set("sort", query.sort);
    params.set("page", String(nextPage));
    params.set("limit", String(limit));

    return `/tools?${params.toString()}`;
  }

  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="Directory"
        title="Search and compare AI tools."
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
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Local search matched {tools.total} tool(s) in MongoDB. External discovery will stream in below without blocking the page.
            </p>
            <p className="text-sm text-muted-foreground">
              This query also checks live web sources and removes duplicates by domain.
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
          <div className="mt-4 grid gap-5 lg:grid-cols-3">
            {tools.data.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
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
