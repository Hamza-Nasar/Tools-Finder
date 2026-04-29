import { getTodayToolsFeedCached } from "@/lib/data/tools";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/shared/page-hero";
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
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Daily feed"
        title="Today in AI tools"
        description="A daily snapshot of what launched, what is gaining momentum, and what is worth testing first."
        stats={[
          { label: "New today", value: String(feed.todayNew.length), detail: "tools added since midnight" },
          { label: "Trending today", value: String(feed.trendingToday.length), detail: "based on current-day activity" },
          { label: "Editor picks", value: String(feed.editorPicks.length), detail: "curated standouts from the feed" }
        ]}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Fresh launches</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Monitor what was published recently before the wider market catches up.
          </p>
        </div>
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Momentum</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Trending signals blend views and saves to highlight active movement.
          </p>
        </div>
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Editorial</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Editor picks add a qualitative layer to the quantitative ranking stream.
          </p>
        </div>
      </section>

      <div className="mt-10">
        <TodayToolsFeed feed={feed} />
      </div>
    </div>
  );
}
