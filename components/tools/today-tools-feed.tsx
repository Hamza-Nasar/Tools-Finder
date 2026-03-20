import type { Tool, TodayToolsFeed } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { ToolCard } from "@/components/tools/tool-card";

function FeedSection({
  eyebrow,
  title,
  description,
  tools
}: {
  eyebrow: string;
  title: string;
  description: string;
  tools: Tool[];
}) {
  if (!tools.length) {
    return null;
  }

  return (
    <section className="space-y-8">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-5 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export function TodayToolsFeed({ feed }: { feed: TodayToolsFeed }) {
  return (
    <div className="space-y-12">
      <FeedSection
        eyebrow="Today"
        title="Today's new tools"
        description="Fresh tools added since midnight, ready for early discovery."
        tools={feed.todayNew}
      />
      <FeedSection
        eyebrow="Trending today"
        title="Trending today"
        description="The tools picking up the strongest activity signals over the current day."
        tools={feed.trendingToday}
      />
      <FeedSection
        eyebrow="Editor picks"
        title="Editor picks"
        description="Standout tools selected from featured listings and high-signal recent additions."
        tools={feed.editorPicks}
      />
    </div>
  );
}
