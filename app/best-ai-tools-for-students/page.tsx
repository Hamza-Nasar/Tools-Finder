import { getPublicToolList } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { getSeoLandingConfig } from "@/lib/seo-landings";
import { SeoLandingPage } from "@/components/marketing/seo-landing-page";

const config = getSeoLandingConfig("best-ai-tools-for-students");

export const metadata = buildMetadata({
  title: config?.title ?? "Best AI Tools for Students",
  description: config?.description ?? "Browse the best AI tools for students from the curated discovery engine.",
  path: "/best-ai-tools-for-students",
  keywords: ["best ai tools for students", "student ai tools", "free ai tools for studying"]
});

export default async function BestAiToolsForStudentsPage() {
  const pageConfig = config!;
  const tools = await getPublicToolList({
    page: 1,
    limit: pageConfig.query.limit ?? 12,
    pricing: pageConfig.query.pricing,
    sort: pageConfig.query.sort ?? "popular"
  });

  return <SeoLandingPage config={pageConfig} tools={tools.data} />;
}
