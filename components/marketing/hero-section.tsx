import Link from "next/link";
import { ArrowRight, BrainCircuit, Flame, Radar, Search, Sparkles, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compactNumber } from "@/lib/utils";

export function HeroSection({
  totalTools,
  totalCategories,
  featuredCount,
  trendingTools,
  popularCategories,
  dailyCount
}: {
  totalTools: number;
  totalCategories: number;
  featuredCount: number;
  trendingTools: string[];
  popularCategories: string[];
  dailyCount: number;
}) {
  return (
    <section className="page-frame pb-16 pt-14 md:pb-24 md:pt-20">
      <div className="section-shell hero-mesh premium-grid relative overflow-hidden px-6 py-10 shadow-glow md:px-12 md:py-16">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(0,133,161,0.16),transparent_58%)] lg:block" />
        <div className="absolute -left-16 top-24 h-44 w-44 rounded-full bg-secondary/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        <div className="relative grid gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/82 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Best free online tools for 2026
            </span>
            <h1 className="mt-6 font-[family-name:var(--font-heading)] text-[2.9rem] font-bold leading-[0.98] md:text-[5.2rem]">
              Best free online tools for SEO, PDF, image, and
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                {" "}AI workflows.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              Find fast, no-signup tools for everyday work: SEO audits, PDF cleanup, image conversion, AI research, content, coding, design, and marketing. Search by workflow and compare the strongest options before you commit.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-white/70 px-3 py-1.5">Free and fast</span>
              <span className="rounded-full border border-border/70 bg-white/70 px-3 py-1.5">No signup routes</span>
              <span className="rounded-full border border-border/70 bg-white/70 px-3 py-1.5">SEO, PDF, image, and AI tools</span>
            </div>
            <form
              action="/tools"
              className="mt-8 flex flex-col gap-3 rounded-[1.7rem] border border-white/80 bg-white/82 p-3 shadow-premium md:flex-row"
            >
              <div className="flex flex-1 items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/70 px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search SEO tools, PDF tools, image tools, or AI workflows"
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="md:min-w-[180px]">
                Find free tools
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/find-ai-tool">
                  Open AI Finder
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/seo-tools">Open free SEO tools</Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {trendingTools.map((toolName) => (
                <Link
                  key={toolName}
                  href={`/tools?q=${encodeURIComponent(toolName)}`}
                  className="interactive-chip rounded-full border border-border bg-white/78 px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
                >
                  {toolName}
                </Link>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="interactive-panel rounded-[1.4rem] border border-white/85 bg-white/82 px-4 py-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">Catalog</p>
                <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold">
                  {compactNumber(totalTools)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">approved tools ready to compare</p>
              </div>
              <div className="interactive-panel rounded-[1.4rem] border border-white/85 bg-white/82 px-4 py-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">Categories</p>
                <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold">
                  {compactNumber(totalCategories)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">workflow lanes for focused discovery</p>
              </div>
              <div className="interactive-panel rounded-[1.4rem] border border-white/85 bg-white/82 px-4 py-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">Signal</p>
                <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold">
                  {compactNumber(dailyCount)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">fresh signals across the market</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="inner-glow rounded-[1.8rem] border border-slate-900/90 bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/72">
                    <Radar className="h-3.5 w-3.5" />
                    Free tool finder
                  </p>
                  <h2 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-semibold leading-tight md:text-[2rem]">
                    Start with the task, compare the best free options, then build a workflow that saves time.
                  </h2>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Live
                </span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Most active lanes
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {popularCategories.map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-sm font-medium text-white/88"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Revenue surface
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold">
                    {compactNumber(featuredCount)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    featured placements reviewed inside the same discovery experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href="/find-ai-tool"
                className="interactive-panel rounded-[1.5rem] border border-white/85 bg-white/82 p-5 shadow-sm"
              >
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-semibold">Describe the job</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Match tools from plain-language use cases instead of browsing blind.
                </p>
              </Link>
              <Link
                href="/today-ai-tools"
                className="interactive-panel rounded-[1.5rem] border border-white/85 bg-white/82 p-5 shadow-sm"
              >
                <Flame className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-semibold">Track daily shifts</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Review new tools and trending moves before they become obvious.
                </p>
              </Link>
              <Link
                href="/workflows"
                className="interactive-panel rounded-[1.5rem] border border-white/85 bg-white/82 p-5 shadow-sm"
              >
                <Workflow className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-[family-name:var(--font-heading)] text-xl font-semibold">Copy proven flows</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  See how strong tools fit together inside repeatable, outcome-based systems.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
