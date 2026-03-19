import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlugCached } from "@/lib/data/categories";
import { getPublicToolList } from "@/lib/data/tools";
import { isAppError, isDatabaseUnavailableError } from "@/lib/errors";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { ToolCard } from "@/components/tools/tool-card";

async function loadCategory(slug: string) {
  try {
    return {
      category: await getCategoryBySlugCached(slug),
      unavailable: false
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        category: null,
        unavailable: true
      };
    }

    if (isAppError(error) && error.statusCode === 404) {
      return {
        category: null,
        unavailable: false
      };
    }

    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { category, unavailable } = await loadCategory(slug);

  if (unavailable) {
    return buildMetadata({
      title: "Directory temporarily unavailable",
      description: "The category directory is temporarily unavailable while the database connection is being restored."
    });
  }

  if (!category) {
    return buildMetadata({
      title: "Category not found",
      description: "The requested AI tools category could not be found."
    });
  }

  return buildMetadata({
    title: `${category.name} AI Tools`,
    description: category.description,
    path: `/categories/${category.slug}`
  });
}

export default async function CategoryDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { category, unavailable } = await loadCategory(slug);

  if (unavailable) {
    return (
      <div className="page-frame py-12">
        <EmptyState
          label="Offline"
          title="Category pages are temporarily unavailable"
          description="The directory cannot reach its database right now. Restore the MongoDB connection and refresh the page."
          ctaHref="/categories"
          ctaLabel="Back to categories"
        />
      </div>
    );
  }

  if (!category) {
    notFound();
  }

  const tools = await getPublicToolList({
    category: category.slug,
    sort: "popular",
    page: 1,
    limit: 12
  });
  const featuredTools = await getPublicToolList({
    category: category.slug,
    featured: true,
    sort: "featured",
    page: 1,
    limit: 3
  });
  const regularTools = tools.data.filter(
    (tool) => !featuredTools.data.some((featuredTool) => featuredTool.id === tool.id)
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} AI Tools`,
    description: category.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.data.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/tools/${tool.slug}`),
        name: tool.name
      }))
    }
  };

  return (
    <div className="page-frame py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageHero
        eyebrow="Category"
        title={category.name}
        description={category.description}
        actions={
          <Button asChild variant="outline">
            <Link href="/submit">Submit a tool</Link>
          </Button>
        }
        stats={[
          { label: "Tools in category", value: String(tools.total), detail: "currently indexed for this workflow" },
          { label: "Sort mode", value: "Popular", detail: "surface the strongest discovery signals first" },
          { label: "Use case", value: "Curated", detail: "designed for focused comparison" }
        ]}
      />

      {featuredTools.data.length ? (
        <div className="mt-8">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Featured in this category</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Paid spotlight placements stay pinned above the broader category feed.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {featuredTools.data.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      ) : null}

      {tools.data.length ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {regularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No tools are listed in this category yet"
            description="This category page is ready, but the catalog has not been populated with matching tools."
            ctaHref="/submit"
            ctaLabel="Submit a tool"
          />
        </div>
      )}
    </div>
  );
}
