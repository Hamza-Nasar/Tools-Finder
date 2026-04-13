import { notFound } from "next/navigation";
import { ToolSeoPage } from "@/components/marketing/tool-seo-page";
import { buildMetadata } from "@/lib/seo";
import { getToolSeoPage, toolSeoPages } from "@/lib/tool-seo-pages";

export function generateStaticParams() {
  return toolSeoPages.map((page) => ({
    slug: page.slug
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getToolSeoPage(slug);

  if (!page) {
    return buildMetadata({
      title: "Page not found",
      description: "The requested page could not be found.",
      noIndex: true
    });
  }

  return buildMetadata({
    title: page.title,
    description: page.metaDescription,
    path: `/${page.slug}`,
    keywords: page.keywords
  });
}

export default async function LongTailToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getToolSeoPage(slug);

  if (!page) {
    notFound();
  }

  return <ToolSeoPage page={page} />;
}
