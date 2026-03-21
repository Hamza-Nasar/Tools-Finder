import { getPublicToolList } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { getSeoLandingConfig } from "@/lib/seo-landings";
import { SeoLandingPage } from "@/components/marketing/seo-landing-page";

const config = getSeoLandingConfig("ai-tools-for-marketers");

export const metadata = buildMetadata({
  title: config?.title ?? "AI Tools for Marketers",
  description: config?.description ?? "Browse AI tools for marketers from the live directory.",
  path: "/ai-tools-for-marketers",
  keywords: ["ai tools for marketers", "marketing ai tools", "ai tools for seo"]
});

export default async function AiToolsForMarketersPage() {
  const pageConfig = config!;
  const tools = await getPublicToolList({
    page: 1,
    limit: pageConfig.query.limit ?? 12,
    category: pageConfig.query.category,
    pricing: pageConfig.query.pricing,
    tags: pageConfig.query.tags,
    sort: pageConfig.query.sort ?? "popular"
  });

  return <SeoLandingPage config={pageConfig} tools={tools.data} />;
}
