import { notFound } from "next/navigation";
import { BlogPostPage } from "@/components/marketing/blog-post-page";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return buildMetadata({
      title: "Article not found",
      description: "The requested article could not be found.",
      noIndex: true
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    keywords: post.keywords,
    type: "article"
  });
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostPage post={post} />;
}
