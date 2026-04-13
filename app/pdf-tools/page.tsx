import { OnlineToolLandingPage } from "@/components/marketing/online-tool-landing-page";
import { getOnlineToolLandingConfig } from "@/lib/online-tool-landings";
import { buildMetadata } from "@/lib/seo";

const config = getOnlineToolLandingConfig("pdf-tools");

export const metadata = buildMetadata({
  title: config?.title ?? "Best Free PDF Tools",
  description: config?.metaDescription ?? "Find free online PDF tools for fast browser-based document workflows.",
  path: "/pdf-tools",
  keywords: config?.keywords
});

export default function PdfToolsPage() {
  return <OnlineToolLandingPage config={config!} />;
}
