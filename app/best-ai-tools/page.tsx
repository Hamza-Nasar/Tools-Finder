import { getPublicToolList } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { getSeoLandingConfig } from "@/lib/seo-landings";
import { SeoLandingPage } from "@/components/marketing/seo-landing-page";

const config = getSeoLandingConfig("best-ai-tools");

export const metadata = buildMetadata({
  title: config?.title ?? "Best AI Tools",
  description: config?.description ?? "Browse the best AI tools from the curated discovery engine.",
  path: "/best-ai-tools",
  keywords: ["best ai tools", "top ai apps", "ai tools directory"]
});

export default async function BestAiToolsPage() {
  const pageConfig = config!;
  const tools = await getPublicToolList({
    page: 1,
    limit: pageConfig.query.limit ?? 12,
    sort: pageConfig.query.sort ?? "popular"
  });

  return <SeoLandingPage config={pageConfig} tools={tools.data} />;
}
