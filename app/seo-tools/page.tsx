import { OnlineToolLandingPage } from "@/components/marketing/online-tool-landing-page";
import { getOnlineToolLandingConfig } from "@/lib/online-tool-landings";
import { buildMetadata } from "@/lib/seo";

const config = getOnlineToolLandingConfig("seo-tools");

export const metadata = buildMetadata({
  title: config?.title ?? "Best Free SEO Tools",
  description: config?.metaDescription ?? "Find free online SEO tools for audits, keywords, content, and rankings.",
  path: "/seo-tools",
  keywords: config?.keywords
});

export default function SeoToolsPage() {
  return <OnlineToolLandingPage config={config!} />;
}
