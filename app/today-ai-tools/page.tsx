import { getTodayToolsFeedCached } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/shared/page-hero";
import { LiveDiscoveryFeed } from "@/components/tools/live-discovery-feed";
import { TodayToolsFeed } from "@/components/tools/today-tools-feed";

export const metadata = buildMetadata({
  title: "Today in AI Tools",
  description: "See today's new AI tools, trending tools, and editor picks in one daily feed.",
  path: "/today-ai-tools",
  keywords: ["today ai tools", "daily ai tools", "trending ai tools today"]
});

export default async function TodayAiToolsPage() {
  const feed = await getTodayToolsFeedCached();

  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="Daily feed"
        title="Today in AI tools"
        description="A daily snapshot of what just launched, what is gaining momentum, and what stands out in the current catalog."
        stats={[
          { label: "New today", value: String(feed.todayNew.length), detail: "tools added since midnight" },
          { label: "Trending today", value: String(feed.trendingToday.length), detail: "based on current-day activity" },
          { label: "Editor picks", value: String(feed.editorPicks.length), detail: "curated standouts from the feed" }
        ]}
      />

      <div className="mt-10">
        <TodayToolsFeed feed={feed} />
      </div>

      <div className="mt-14">
        <LiveDiscoveryFeed />
      </div>
    </div>
  );
}
