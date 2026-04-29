import { notFound } from "next/navigation";
import Link from "next/link";
import { getRelatedToolsCached, getToolBySlugCached } from "@/lib/data/tools";
import { isAppError, isDatabaseUnavailableError } from "@/lib/errors";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHero } from "@/components/shared/page-hero";
import { ToolCard } from "@/components/tools/tool-card";
import { Button } from "@/components/ui/button";

async function loadTool(slug: string) {
  try {
    return {
      tool: await getToolBySlugCached(slug),
      unavailable: false
    };
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return {
        tool: null,
        unavailable: true
      };
    }

    if (isAppError(error) && error.statusCode === 404) {
      return {
        tool: null,
        unavailable: false
      };
    }

    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { tool, unavailable } = await loadTool(slug);

  if (unavailable) {
    return buildMetadata({
      title: "Alternatives temporarily unavailable",
      description: "Alternative tool recommendations are temporarily unavailable while the database connection is being restored."
    });
  }

  if (!tool) {
    return buildMetadata({
      title: "Tool alternatives not found",
      description: "The requested alternative page could not be generated because the base tool was not found."
    });
  }

  const year = new Date().getFullYear();

  return buildMetadata({
    title: `Best ${tool.name} Alternatives (${year})`,
    description: `Compare the best ${tool.name} alternatives across ${tool.category.toLowerCase()} workflows, shared features, and overlapping tags.`,
    path: `/alternatives/${tool.slug}`,
    keywords: [`${tool.name} alternatives`, `${tool.category} tools`, ...tool.tags.slice(0, 4)]
  });
}

export default async function ToolAlternativesPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { tool, unavailable } = await loadTool(slug);

  if (unavailable) {
    return (
      <div className="page-frame py-14">
        <EmptyState
          label="Offline"
          title="Alternative recommendations are temporarily unavailable"
          description="The platform cannot reach its database right now. Restore the MongoDB connection and refresh the page."
          ctaHref="/tools"
          ctaLabel="Back to tools"
        />
      </div>
    );
  }

  if (!tool) {
    notFound();
  }

  const alternatives = await getRelatedToolsCached({
    slug: tool.slug,
    categorySlug: tool.categorySlug,
    tags: tool.tags,
    limit: 12
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${tool.name} alternatives`,
    description: `Alternative AI tools to ${tool.name} in ${tool.category}.`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: alternatives.map((alternative, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/tools/${alternative.slug}`),
        name: alternative.name
      }))
    }
  };

  return (
    <div className="page-frame py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageHero
        eyebrow="Alternatives"
        title={`Best ${tool.name} alternatives`}
        description={`Explore tools in ${tool.category.toLowerCase()} with overlapping tags, similar use cases, and adjacent workflows.`}
        actions={
          <>
            <Button asChild>
              <Link href={`/tools/${tool.slug}`}>Back to {tool.name}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/categories/${tool.categorySlug}`}>Browse {tool.category}</Link>
            </Button>
          </>
        }
        stats={[
          {
            label: "Alternatives found",
            value: String(alternatives.length),
            detail: "ranked by shared category, tags, and current traction"
          },
          {
            label: "Base category",
            value: tool.category,
            detail: "used as the primary similarity signal"
          }
        ]}
      />

      <div className="mt-10">
        {alternatives.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {alternatives.map((alternative) => (
              <ToolCard key={alternative.id} tool={alternative} />
            ))}
          </div>
        ) : (
          <EmptyState
            label="Alternatives"
            title={`No alternatives are indexed for ${tool.name} yet`}
            description="As more tools are added with matching categories and tags, they will surface here automatically."
            ctaHref={`/categories/${tool.categorySlug}`}
            ctaLabel={`Browse ${tool.category} tools`}
          />
        )}
      </div>
    </div>
  );
}
