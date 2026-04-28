import Link from "next/link";
import { ArrowRight, Layers3, Radar, Sparkles } from "lucide-react";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { siteConfig } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const footerColumns = [
  {
    title: "Explore",
    links: [
      { href: "/tools", label: "Directory" },
      { href: "/categories", label: "Categories" },
      { href: "/today-ai-tools", label: "Today AI Tools" },
      { href: "/best-ai-tools", label: "Best AI Tools" },
      { href: "/seo-tools", label: "SEO Tools" },
      { href: "/blog", label: "Blog" }
    ]
  },
  {
    title: "Workflows",
    links: [
      { href: "/find-ai-tool", label: "AI Finder" },
      { href: "/workflows", label: "Workflows" },
      { href: "/prompts", label: "Prompt Library" },
      { href: "/my-stack", label: "My Stack" },
      { href: "/image-tools", label: "Image Tools" },
      { href: "/image-compressor", label: "Image Compressor" }
    ]
  },
  {
    title: "Growth",
    links: [
      { href: "/submit", label: "Submit Tool" },
      { href: "/best-free-ai-tools", label: "Best Free AI Tools" },
      { href: "/pdf-tools", label: "PDF Tools" },
      { href: "/pdf-merger", label: "PDF Merger" },
      { href: "/favorites", label: "Favorites" },
      { href: "/auth/login", label: "Login" }
    ]
  }
];

const footerHighlights = [
  {
    icon: Radar,
    label: "Intent search",
    text: "Start from the job to be done, then compare tools with clearer context."
  },
  {
    icon: Layers3,
    label: "Workflow stacks",
    text: "Save practical combinations instead of tracking disconnected product links."
  },
  {
    icon: Sparkles,
    label: "Daily signals",
    text: "Return to new launches, rising tools, and focused editor picks."
  }
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-background/[0.82] backdrop-blur">
      <div className="page-frame py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <MotionReveal className="flex flex-col gap-6" y={18}>
            <Link href="/" className="group inline-flex w-fit items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[1rem] bg-primary font-[family-name:var(--font-heading)] text-base font-bold text-primary-foreground shadow-glow transition-transform duration-300 group-hover:scale-105">
                AI
              </span>
              <span>
                <span className="block font-[family-name:var(--font-heading)] text-xl font-semibold">
                  {siteConfig.name}
                </span>
                <span className="block text-sm text-muted-foreground">
                  AI discovery and practical workflow shortcuts
                </span>
              </span>
            </Link>

            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Decision layer</p>
              <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight md:text-4xl">
                Find tools faster without losing the comparison context.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                Browse focused categories, run intent-based searches, and keep useful products organized into repeatable stacks.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/find-ai-tool">
                  Open AI Finder
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/submit">Feature your tool</Link>
              </Button>
            </div>
          </MotionReveal>

          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-3">
              {footerHighlights.map((item, index) => {
                const Icon = item.icon;

                return (
                  <MotionReveal
                    key={item.label}
                    delay={index * 0.05}
                    className="surface-card-hover rounded-[1.35rem] border border-white/70 bg-white/[0.72] p-5 shadow-sm backdrop-blur"
                    y={16}
                  >
                    <Icon className="size-5 text-primary" aria-hidden="true" />
                    <p className="mt-4 font-[family-name:var(--font-heading)] text-lg font-semibold">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </MotionReveal>
                );
              })}
            </div>

            <MotionReveal
              className="rounded-[1.5rem] border border-border/70 bg-white/70 p-5 shadow-sm backdrop-blur"
              y={18}
            >
              <div className="grid gap-7 sm:grid-cols-3">
                {footerColumns.map((column) => (
                  <div key={column.title} className="flex flex-col gap-3">
                    <p className="text-sm font-semibold text-foreground">{column.title}</p>
                    <div className="flex flex-col gap-2">
                      {column.links.map((link) => (
                        <Link key={link.href} href={link.href} className="footer-link text-sm text-muted-foreground">
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </MotionReveal>
          </div>
        </div>

        <Separator className="mt-10" />
        <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Built for clearer AI discovery decisions and higher-intent product visibility.</p>
          <Link href="/submit" className="footer-link font-medium text-foreground">
            Submit your product
          </Link>
        </div>
      </div>
    </footer>
  );
}
