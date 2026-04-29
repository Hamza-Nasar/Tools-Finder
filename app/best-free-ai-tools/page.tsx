import { getPublicToolList } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { getSeoLandingConfig } from "@/lib/seo-landings";
import { SeoLandingPage } from "@/components/marketing/seo-landing-page";

const config = getSeoLandingConfig("best-free-ai-tools");

export const metadata = buildMetadata({
  title: config?.title ?? "Best Free AI Tools",
  description: config?.description ?? "Browse the best free AI tools from the curated discovery engine.",
  path: "/best-free-ai-tools",
  keywords: ["best free ai tools", "free ai tools", "top free ai apps"]
});

export default async function BestFreeAiToolsPage() {
  const pageConfig = config!;
  const tools = await getPublicToolList({
    page: 1,
    limit: pageConfig.query.limit ?? 12,
    pricing: pageConfig.query.pricing,
    sort: pageConfig.query.sort ?? "featured"
  });

  return <SeoLandingPage config={pageConfig} tools={tools.data} />;
}
