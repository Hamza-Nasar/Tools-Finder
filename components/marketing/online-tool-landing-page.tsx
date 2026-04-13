import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { absoluteUrl } from "@/lib/seo";
import type { OnlineToolLandingConfig } from "@/lib/online-tool-landings";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";

export function OnlineToolLandingPage({ config }: { config: OnlineToolLandingConfig }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": absoluteUrl(`${config.path}#webpage`),
        name: config.title,
        description: config.metaDescription,
        url: absoluteUrl(config.path),
        inLanguage: "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": absoluteUrl(`${config.path}#breadcrumbs`),
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
            name: config.heading,
            item: absoluteUrl(config.path)
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl(`${config.path}#faq`),
        mainEntity: config.faqs.map((entry) => ({
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
        eyebrow={config.eyebrow}
        title={config.heading}
        description={config.intro}
        actions={
          <>
            <Button asChild>
              <Link href={config.primaryCta.href}>
                {config.primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={config.secondaryCta.href}>{config.secondaryCta.label}</Link>
            </Button>
          </>
        }
        stats={config.stats}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Quick paths</p>
            <div className="mt-4 grid gap-3">
              {config.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="interactive-panel rounded-[1.15rem] border border-border/70 bg-white/72 px-4 py-4 text-sm font-medium text-foreground hover:bg-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Why this page exists</p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Search visitors often need one fast answer before they compare a larger stack. These pages give Google and
              users a clear route into focused tool categories while linking back to the broader Tools Finder homepage.
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          {config.sections.map((section) => (
            <article key={section.heading} className="section-shell p-7">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="section-shell p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Popular use cases</p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
            Start with the job, then choose the tool.
          </h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {config.useCases.map((useCase) => (
              <Link
                key={useCase.title}
                href={useCase.href}
                className="interactive-panel rounded-[1.5rem] border border-white/75 bg-white/82 p-5 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-semibold">
                  {useCase.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{useCase.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2" id="faq">
        {config.faqs.map((entry) => (
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
