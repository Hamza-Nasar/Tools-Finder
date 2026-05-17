"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MotionReveal } from "@/components/shared/motion-reveal";
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
  const quickTasks = [
    "Compress PDF",
    "Remove background",
    "SEO audit",
    "Summarize PDF"
  ].concat(trendingTools.slice(0, 1));

  return (
    <section className="page-frame pb-16 pt-14 md:pb-24 md:pt-20">
      <div className="section-shell hero-mesh premium-grid relative overflow-hidden px-6 py-10 shadow-glow md:px-12 md:py-16">
        <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        <div className="relative grid gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
          <MotionReveal className="max-w-3xl" y={24}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/[0.82] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Best free online tools for 2026
            </span>
            <h1 className="mt-6 font-[family-name:var(--font-heading)] text-[2.9rem] font-bold leading-[0.98] md:text-[5.2rem]">
              Find the right tool for your task in 60 seconds.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              Describe the job, get a ranked shortlist, and compare options without opening dozens of tabs.
            </p>
            <motion.div
              className="mt-5 flex flex-wrap gap-2 text-sm font-medium text-muted-foreground"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >
              <Badge variant="muted">Free and fast</Badge>
              <Badge variant="muted">No signup routes</Badge>
              <Badge variant="muted">Task-first search</Badge>
            </motion.div>
            <form
              action="/tools"
              className="mt-8 flex flex-col gap-3 rounded-[1.7rem] border border-white/80 bg-white/[0.82] p-3 shadow-premium md:flex-row"
            >
              <div className="flex flex-1 items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/70 px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder='Try "compress PDF", "remove image background", "SEO audit", or "summarize PDF"'
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="md:min-w-[180px]">
                Find my tool
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/find-ai-tool">
                  Find my tool
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/tools">Browse all tools</Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {quickTasks.map((task, index) => (
                <motion.div
                  key={task}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.06 * index }}
                >
                  <Link
                    href={`/tools?q=${encodeURIComponent(task)}`}
                    className="interactive-chip rounded-full border border-border bg-white/[0.78] px-4 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    {task}
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Card className="interactive-panel border-white/85 bg-white/[0.82] shadow-sm">
                <CardContent className="px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">Catalog</p>
                <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold">
                  {compactNumber(totalTools)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">approved tools ready to compare</p>
                </CardContent>
              </Card>
              <Card className="interactive-panel border-white/85 bg-white/[0.82] shadow-sm">
                <CardContent className="px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">Categories</p>
                <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold">
                  {compactNumber(totalCategories)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">workflow lanes for focused discovery</p>
                </CardContent>
              </Card>
              <Card className="interactive-panel border-white/85 bg-white/[0.82] shadow-sm">
                <CardContent className="px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">Signal</p>
                <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold">
                  {compactNumber(dailyCount)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">fresh signals across the market</p>
                </CardContent>
              </Card>
            </div>
          </MotionReveal>

          <MotionReveal className="grid gap-4" delay={0.08} y={24}>
            <Card className="section-shell p-0">
              <CardContent className="p-6">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">How it works</p>
              <ol className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
                <li>1. Describe the task in plain language.</li>
                <li>2. Get ranked recommendations with clear fit signals.</li>
                <li>3. Compare top options before clicking out.</li>
              </ol>
              <div className="mt-5 flex flex-wrap gap-2">
                {popularCategories.slice(0, 5).map((category) => (
                  <Badge key={category} variant="muted">
                    {category}
                  </Badge>
                ))}
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                {compactNumber(featuredCount)} featured vendors and {compactNumber(dailyCount)} fresh market signals are tracked daily.
              </p>
              </CardContent>
            </Card>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
