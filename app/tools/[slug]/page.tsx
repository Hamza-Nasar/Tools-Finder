import Link from "next/link";
import { notFound } from "next/navigation";
import { getRelatedToolsCached, getToolBySlugCached } from "@/lib/data/tools";
import { isAppError, isDatabaseUnavailableError } from "@/lib/errors";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { getOptionalSession } from "@/lib/server-guards";
import { FavoriteService } from "@/lib/services/favorite-service";
import { UserService } from "@/lib/services/user-service";
import { FeatureListingButton } from "@/components/tools/feature-listing-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FavoriteToggle } from "@/components/tools/favorite-toggle";
import { ToolDetail } from "@/components/tools/tool-detail";
import { ToolViewTracker } from "@/components/tools/tool-view-tracker";

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
      title: "Directory temporarily unavailable",
      description: "The tool directory is temporarily unavailable while the database connection is being restored."
    });
  }

  if (!tool) {
    return buildMetadata({
      title: "Tool not found",
      description: "The requested AI tool could not be found."
    });
  }

  return buildMetadata({
    title: `${tool.name} | AI Tools Finder`,
    description: tool.description,
    path: `/tools/${tool.slug}`,
    keywords: [tool.name, tool.category, ...tool.tags.slice(0, 5)]
  });
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { tool, unavailable } = await loadTool(slug);

  if (unavailable) {
    return (
      <div className="page-frame py-12">
        <EmptyState
          label="Offline"
          title="Tool details are temporarily unavailable"
          description="The directory cannot reach its database right now. Restore the MongoDB connection and refresh the page."
          ctaHref="/tools"
          ctaLabel="Back to directory"
        />
      </div>
    );
  }

  if (!tool) {
    notFound();
  }

  const [relatedTools, session] = await Promise.all([
    getRelatedToolsCached({
      slug: tool.slug,
      categorySlug: tool.categorySlug,
      tags: tool.tags,
      limit: 6
    }),
    getOptionalSession()
  ]);
  const user = session?.user ? await UserService.syncSessionUser(session) : null;
  const isFavorited = user ? await FavoriteService.isFavorited(user.id, tool.id) : false;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: tool.category,
    operatingSystem: "Web",
    mainEntityOfPage: absoluteUrl(`/tools/${tool.slug}`),
    sameAs: [tool.website],
    offers: {
      "@type": "Offer",
      price: tool.pricing === "Paid" ? "Paid" : "0",
      priceCurrency: "USD"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(tool.rating.toFixed(1)),
      ratingCount: tool.reviewCount
    },
    url: absoluteUrl(`/tools/${tool.slug}`)
  };

  return (
    <>
      <ToolViewTracker slug={tool.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ToolDetail
        tool={tool}
        relatedTools={relatedTools}
        action={
          <div className="space-y-3">
            {user ? (
              <FavoriteToggle toolId={tool.id} toolSlug={tool.slug} initialIsFavorited={isFavorited} />
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href={`/auth/sign-in?callbackUrl=${encodeURIComponent(`/tools/${tool.slug}`)}`}>
                  Sign in to save
                </Link>
              </Button>
            )}
            <FeatureListingButton
              toolSlug={tool.slug}
              isFeatured={tool.featured}
              featuredUntil={tool.featuredUntil ?? null}
            />
          </div>
        }
      />
    </>
  );
}
