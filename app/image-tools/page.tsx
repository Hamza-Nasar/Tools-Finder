import { OnlineToolLandingPage } from "@/components/marketing/online-tool-landing-page";
import { getOnlineToolLandingConfig } from "@/lib/online-tool-landings";
import { buildMetadata } from "@/lib/seo";

const config = getOnlineToolLandingConfig("image-tools");

export const metadata = buildMetadata({
  title: config?.title ?? "Best Free Image Tools",
  description: config?.metaDescription ?? "Find free online image tools for fast browser-based image workflows.",
  path: "/image-tools",
  keywords: config?.keywords
});

export default function ImageToolsPage() {
  return <OnlineToolLandingPage config={config!} />;
}
