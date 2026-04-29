import { getPublicToolList } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { getSeoLandingConfig } from "@/lib/seo-landings";
import { SeoLandingPage } from "@/components/marketing/seo-landing-page";

const config = getSeoLandingConfig("ai-tools-for-youtubers");

export const metadata = buildMetadata({
  title: config?.title ?? "AI Tools for YouTubers",
  description: config?.description ?? "Browse AI tools for YouTubers from the curated discovery engine.",
  path: "/ai-tools-for-youtubers",
  keywords: ["ai tools for youtubers", "youtube ai tools", "ai tools for creators"]
});

export default async function AiToolsForYoutubersPage() {
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
