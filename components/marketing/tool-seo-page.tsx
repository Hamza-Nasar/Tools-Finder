import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { absoluteUrl } from "@/lib/seo";
import type { ToolSeoPageConfig } from "@/lib/tool-seo-pages";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ToolSeoPage({ page }: { page: ToolSeoPageConfig }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": absoluteUrl(`/${page.slug}#webpage`),
        name: page.title,
        description: page.metaDescription,
        url: absoluteUrl(`/${page.slug}`),
        inLanguage: "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": absoluteUrl(`/${page.slug}#breadcrumbs`),
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl("/")
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.categoryLabel,
            item: absoluteUrl(page.categoryHref)
          },
          {
            "@type": "ListItem",
            position: 3,
            name: page.heading,
            item: absoluteUrl(`/${page.slug}`)
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl(`/${page.slug}#faq`),
        mainEntity: page.faqs.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="page-frame py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PageHero
        eyebrow={page.eyebrow}
        title={page.heading}
        description={page.intro}
        actions={
          <>
            <Button asChild>
              <Link href={page.searchHref}>
                Find matching tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={page.categoryHref}>{page.categoryLabel}</Link>
            </Button>
          </>
        }
        stats={[
          { label: "Intent", value: "Long-tail", detail: "targets specific tool searches with clearer conversion intent" },
          { label: "Schema", value: "FAQ", detail: "includes FAQ and breadcrumb structured data" },
          { label: "Next step", value: "Compare", detail: "links into category, directory, and blog pages" }
        ]}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <aside className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Internal links</p>
            <div className="mt-4 grid gap-3">
              <Link
                href="/"
                className="interactive-panel rounded-[1.15rem] border border-border/70 bg-white/72 px-4 py-4 text-sm font-medium text-foreground hover:bg-white"
              >
                Best free online tools
              </Link>
              <Link
                href={page.categoryHref}
                className="interactive-panel rounded-[1.15rem] border border-border/70 bg-white/72 px-4 py-4 text-sm font-medium text-foreground hover:bg-white"
              >
                {page.categoryLabel}
              </Link>
              <Link
                href={page.blogHref}
                className="interactive-panel rounded-[1.15rem] border border-border/70 bg-white/72 px-4 py-4 text-sm font-medium text-foreground hover:bg-white"
              >
                {page.blogLabel}
              </Link>
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Target keywords</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {page.keywords.map((keyword) => (
                <Badge key={keyword} variant="muted">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {page.sections.map((section) => (
            <article key={section.heading} className="section-shell p-7">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}

          <section className="section-shell p-7">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
              What to look for before choosing a tool
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {page.features.map((feature) => (
                <div key={feature} className="rounded-[1.1rem] border border-border/70 bg-white/75 p-4 text-sm leading-6">
                  <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
                  {feature}
                </div>
              ))}
            </div>
          </section>

          <section className="section-shell p-7">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
              How to use this page to move faster
            </h2>
            <ol className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
              {page.steps.map((step, index) => (
                <li key={step} className="rounded-[1.1rem] border border-border/70 bg-white/75 p-4">
                  <span className="mr-3 font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="section-shell p-7">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
              Why this page targets a specific long-tail keyword
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground">
              <p>
                Broad category pages are useful, but searchers often arrive with a precise job already in mind.
                A focused page for {page.heading.toLowerCase()} can answer that intent faster than a generic
                directory page because it explains the task, the selection criteria, the common workflow, and the
                next internal step in one place.
              </p>
              <p>
                This page connects the homepage, the {page.categoryLabel.toLowerCase()} hub, matching directory
                searches, related long-tail tool pages, and a supporting blog article. That structure gives users a
                natural path from learning to comparison, while giving search engines clearer topical relationships
                between free online tools, category pages, individual tool intents, and educational content.
              </p>
              <p>
                Use the links on this page when you want to keep moving through the same workflow. Start with the
                specific tool type, compare sibling tools if the task changes, read the guide for more context, and
                return to the category hub when you need a broader set of options.
              </p>
            </div>
          </section>
        </div>
      </section>

      <section className="mt-8 section-shell p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Related pages</p>
        <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
          Continue through the topic cluster.
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {page.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="interactive-panel rounded-[1.15rem] border border-border/70 bg-white/75 p-4 text-sm font-semibold text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3" id="faq">
        {page.faqs.map((entry) => (
          <div key={entry.question} className="surface-card p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold leading-tight">
              {entry.question}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{entry.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
