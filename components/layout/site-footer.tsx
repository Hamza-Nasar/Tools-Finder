import Link from "next/link";
import { ArrowRight, Flame, Layers3, Radar } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  const footerColumns = [
    {
      title: "Explore",
      links: [
        { href: "/tools", label: "Directory" },
        { href: "/categories", label: "Categories" },
        { href: "/today-ai-tools", label: "Today AI Tools" },
        { href: "/best-ai-tools", label: "Best AI Tools" }
      ]
    },
    {
      title: "Workflows",
      links: [
        { href: "/find-ai-tool", label: "AI Finder" },
        { href: "/workflows", label: "Workflows" },
        { href: "/prompts", label: "Prompt Library" },
        { href: "/my-stack", label: "My Stack" }
      ]
    },
    {
      title: "Growth",
      links: [
        { href: "/submit", label: "Submit Tool" },
        { href: "/best-free-ai-tools", label: "Best Free AI Tools" },
        { href: "/favorites", label: "Favorites" },
        { href: "/auth/login", label: "Login" }
      ]
    }
  ];

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-slate-900/80 bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_24rem),radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_26rem),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,1))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="page-frame relative py-12 md:py-16">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <div className="grid gap-10 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-cyan-400 font-[family-name:var(--font-heading)] text-lg font-bold text-slate-950 shadow-[0_20px_45px_rgba(34,211,238,0.22)]">
                  AI
                </div>
                <div>
                  <p className="font-[family-name:var(--font-heading)] text-xl font-semibold">{siteConfig.name}</p>
                  <p className="text-sm text-white/60">AI research and discovery for serious buyers, operators, and founders</p>
                </div>
              </div>

              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                  Finish strong
                </p>
                <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight md:text-5xl">
                  Stop sending people to flat lists. Route them into a sharper AI buying journey.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                  The strongest discovery products help buyers decide faster and help founders get discovered in the right context. This product is built around both sides of that loop.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-white/92">
                  <Link href="/find-ai-tool">
                    Open AI Finder
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <Link href="/submit">Feature your tool</Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                  <Radar className="h-5 w-5 text-cyan-200" />
                  <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/52">
                    Discovery
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-heading)] text-xl font-semibold">Search by intent</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Let buyers start from the job they need done, not from brand recall.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                  <Flame className="h-5 w-5 text-amber-200" />
                  <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/52">
                    Momentum
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-heading)] text-xl font-semibold">Track what moved</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Use daily signals to keep research fresh and worth revisiting.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                  <Layers3 className="h-5 w-5 text-emerald-200" />
                  <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/52">
                    System
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-heading)] text-xl font-semibold">Build complete stacks</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Move visitors from isolated products into reusable workflow combinations.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                  Navigation
                </p>
                <div className="mt-5 grid gap-6 sm:grid-cols-3">
                  {footerColumns.map((column) => (
                    <div key={column.title}>
                      <p className="text-sm font-semibold text-white">{column.title}</p>
                      <div className="mt-4 grid gap-3 text-sm text-white/62">
                        {column.links.map((link) => (
                          <Link key={link.href} href={link.href} className="transition hover:text-white">
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/today-ai-tools"
                  className="interactive-panel rounded-[1.5rem] border border-white/10 bg-white/6 p-5"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-cyan-200/80">
                    Daily feed
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                    What moved today?
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    New launches, rising tools, and editor picks in one focused stream.
                  </p>
                </Link>
                <Link
                  href="/workflows"
                  className="interactive-panel rounded-[1.5rem] border border-white/10 bg-white/6 p-5"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
                    Workflows
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                    See real tool systems
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    Learn how strong products combine into practical operating flows.
                  </p>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/52 sm:flex-row sm:items-center sm:justify-between">
            <p>Built to turn AI discovery into cleaner buyer decisions and higher-intent founder visibility.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin" className="transition hover:text-white">Admin</Link>
              <Link href="/submit" className="transition hover:text-white">Submit your product</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
