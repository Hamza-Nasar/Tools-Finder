import Link from "next/link";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { absoluteUrl } from "@/lib/seo";
import type { BlogPostConfig } from "@/lib/blog-posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function BlogPostPage({ post }: { post: BlogPostConfig }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": absoluteUrl(`/blog/${post.slug}#article`),
        headline: post.title,
        description: post.metaDescription,
        datePublished: post.datePublished,
        dateModified: post.dateModified,
        author: {
          "@type": "Organization",
          name: "Tools Finder"
        },
        publisher: {
          "@type": "Organization",
          name: "Tools Finder",
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/icon.svg")
          }
        },
        mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
        keywords: post.keywords.join(", ")
      },
      {
        "@type": "BreadcrumbList",
        "@id": absoluteUrl(`/blog/${post.slug}#breadcrumbs`),
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
            name: "Blog",
            item: absoluteUrl("/blog")
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: absoluteUrl(`/blog/${post.slug}`)
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl(`/blog/${post.slug}#faq`),
        mainEntity: post.faqs.map((entry) => ({
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
    <article className="page-frame py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <header className="surface-card hero-mesh p-8 md:p-10">
        <div className="flex flex-wrap gap-2">
          <Badge>{post.category}</Badge>
          <Badge variant="muted">{post.readingTime}</Badge>
          <span className="inline-flex items-center rounded-full border border-border bg-white/70 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground">
            <CalendarDays className="mr-2 h-3.5 w-3.5" />
            Updated {post.dateModified}
          </span>
        </div>
        <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-heading)] text-[2.5rem] font-bold leading-[1.02] md:text-[4.25rem]">
          {post.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{post.excerpt}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/blog">All articles</Link>
          </Button>
          {post.relatedLinks[0] ? (
            <Button asChild variant="outline">
              <Link href={post.relatedLinks[0].href}>{post.relatedLinks[0].label}</Link>
            </Button>
          ) : null}
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <aside className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Related pages</p>
            <div className="mt-4 grid gap-3">
              {post.relatedLinks.map((link) => (
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Keywords</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.keywords.map((keyword) => (
                <Badge key={keyword} variant="muted">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {post.sections.map((section) => (
            <section key={section.heading} className="section-shell p-7">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="section-shell p-7">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
              Quick checklist
            </h2>
            <div className="mt-5 grid gap-3">
              {post.checklist.map((item) => (
                <div key={item} className="rounded-[1.1rem] border border-border/70 bg-white/75 p-4 text-sm leading-7">
                  <CheckCircle2 className="mr-3 inline h-5 w-5 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="section-shell p-7">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight">
              How this guide supports the full topic cluster
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground">
              <p>
                This article is designed to do more than answer one isolated query. It links readers into the
                relevant hub pages, individual long-tail tool pages, and comparison paths that help them continue the
                same workflow without returning to Google. That matters for SEO because strong internal linking helps
                distribute authority, clarify topical relationships, and improve the chance that deeper pages are
                crawled and understood.
              </p>
              <p>
                After reading, choose the related page that matches the next action. If you need a tool, open the
                matching utility page. If you need a broader comparison, use the category hub. If the problem is still
                unclear, return to the free online tools homepage and search by task. The best SEO content creates
                this kind of clean path from education to action.
              </p>
              <p>
                For pages targeting competitive searches in 2026, this cluster approach is usually stronger than
                publishing disconnected articles. It gives each guide a reason to exist, gives each tool page
                supporting context, and gives users a clearer route through the site.
              </p>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-8 grid gap-5 lg:grid-cols-3" id="faq">
        {post.faqs.map((entry) => (
          <div key={entry.question} className="surface-card p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold leading-tight">
              {entry.question}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{entry.answer}</p>
          </div>
        ))}
      </section>
    </article>
  );
}
