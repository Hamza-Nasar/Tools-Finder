import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compactNumber } from "@/lib/utils";

export function HeroSection({
  totalTools,
  totalCategories,
  featuredCount,
  trendingTools
}: {
  totalTools: number;
  totalCategories: number;
  featuredCount: number;
  trendingTools: string[];
}) {
  return (
    <section className="page-frame pb-16 pt-14 md:pb-24 md:pt-20">
      <div className="surface-card hero-mesh relative overflow-hidden px-6 py-10 shadow-glow md:px-12 md:py-16">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(0,133,161,0.14),transparent_58%)] lg:block" />
        <div className="absolute -left-16 top-24 h-44 w-44 rounded-full bg-secondary/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/82 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Discover the tools shaping modern workflows
            </span>
            <h1 className="mt-6 font-[family-name:var(--font-heading)] text-[2.9rem] font-bold leading-[0.98] md:text-[5.2rem]">
              Discover AI products with the polish of a premium startup directory.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              Search by workflow, compare standout tools, and build a shortlist that feels closer to Product Hunt than a spreadsheet.
            </p>
            <form
              action="/tools"
              className="mt-8 flex flex-col gap-3 rounded-[1.7rem] border border-white/80 bg-white/82 p-3 shadow-premium md:flex-row"
            >
              <div className="flex flex-1 items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/70 px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search by name, tag, category, or use case"
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="md:min-w-[180px]">
                Search directory
              </Button>
            </form>
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
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="interactive-panel rounded-[1.5rem] border border-white/80 bg-white/82 p-5 shadow-sm">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">Catalog</p>
              <p className="mt-3 font-[family-name:var(--font-heading)] text-4xl font-bold">
                {compactNumber(totalTools)}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">approved tools ready to browse</p>
            </div>
            <div className="interactive-panel rounded-[1.5rem] border border-white/80 bg-white/82 p-5 shadow-sm">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">Categories</p>
              <p className="mt-3 font-[family-name:var(--font-heading)] text-4xl font-bold">
                {compactNumber(totalCategories)}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">entry points for focused discovery</p>
            </div>
            <div className="interactive-panel rounded-[1.5rem] border border-white/80 bg-white/82 p-5 shadow-sm">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">Spotlight</p>
              <p className="mt-3 font-[family-name:var(--font-heading)] text-4xl font-bold">
                {compactNumber(featuredCount)}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">featured tools on paid priority placement</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
