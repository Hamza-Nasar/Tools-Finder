import { getPublicToolList } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { getSeoLandingConfig } from "@/lib/seo-landings";
import { SeoLandingPage } from "@/components/marketing/seo-landing-page";

const config = getSeoLandingConfig("best-ai-tools-for-developers");

export const metadata = buildMetadata({
  title: config?.title ?? "Best AI Tools for Developers",
  description: config?.description ?? "Browse the best AI tools for developers from the live directory.",
  path: "/best-ai-tools-for-developers",
  keywords: ["best ai tools for developers", "developer ai tools", "ai coding apps"]
});

export default async function BestAiToolsForDevelopersPage() {
  const pageConfig = config!;
  const tools = await getPublicToolList({
    page: 1,
    limit: pageConfig.query.limit ?? 12,
    category: pageConfig.query.category,
    sort: pageConfig.query.sort ?? "popular"
  });

  return <SeoLandingPage config={pageConfig} tools={tools.data} />;
}
