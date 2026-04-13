import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { blogPosts } from "@/lib/blog-posts";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";

export const metadata = buildMetadata({
  title: "Free Online Tools Blog 2026: SEO, PDF & Image Guides",
  description:
    "Read practical SEO, PDF, and image tool guides for 2026 with checklists, FAQs, and internal links to free online tools.",
  path: "/blog",
  keywords: ["free online tools blog", "SEO guides", "PDF tools guide", "image tools guide"]
});

export default function BlogIndexPage() {
  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="Blog"
        title="SEO guides for free online tools, rankings, and faster workflows."
        description="Read practical articles that connect search intent to useful tool pages, category hubs, and step-by-step optimization workflows."
        stats={[
          { label: "Articles", value: String(blogPosts.length), detail: "SEO-focused guides ready for internal linking" },
          { label: "Schema", value: "Article", detail: "each post includes Article, FAQ, and Breadcrumb schema" },
          { label: "Cluster", value: "Tools", detail: "links back into SEO, PDF, and image tool pages" }
        ]}
      />

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="interactive-panel section-shell block p-6">
            <div className="flex flex-wrap gap-2">
              <Badge>{post.category}</Badge>
              <Badge variant="muted">{post.readingTime}</Badge>
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-semibold leading-tight">
              {post.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
            <span className="mt-5 inline-flex items-center text-sm font-semibold text-foreground">
              Read article
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
