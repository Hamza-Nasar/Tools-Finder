import { notFound } from "next/navigation";
import { CollectionPage } from "@/components/collections/collection-page";
import { getCollectionToolsCached } from "@/lib/data/tools";
import { getToolCollectionBySlug } from "@/lib/collections";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getToolCollectionBySlug(slug);

  if (!collection) {
    return buildMetadata({
      title: "Collection not found",
      description: "The requested AI tools collection could not be found."
    });
  }

  return buildMetadata({
    title: collection.title,
    description: collection.description,
    path: `/collections/${collection.slug}`,
    keywords: [collection.title, ...(collection.tags ?? []), ...(collection.categorySlugs ?? [])]
  });
}

export default async function CollectionDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getToolCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const tools = await getCollectionToolsCached({
    categorySlugs: collection.categorySlugs,
    tags: collection.tags,
    pricing: collection.pricing,
    limit: 18
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    description: collection.description,
    url: absoluteUrl(`/collections/${collection.slug}`),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/tools/${tool.slug}`),
        name: tool.name
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CollectionPage collection={collection} tools={tools} />
    </>
  );
}
