import { blogPosts } from "@/lib/blog-posts";
import { onlineToolLandingPages } from "@/lib/online-tool-landings";
import { seoLandingPages } from "@/lib/seo-landings";
import { toolSeoPages } from "@/lib/tool-seo-pages";

export interface SiteSearchResult {
  id: string;
  href: string;
  title: string;
  description: string;
  type: "Hub" | "Guide" | "Blog" | "Directory";
  score: number;
}

interface SearchCandidate extends Omit<SiteSearchResult, "score"> {
  keywords: string[];
  body: string;
}

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "best",
  "for",
  "free",
  "in",
  "of",
  "online",
  "or",
  "the",
  "to",
  "tool",
  "tools",
  "with"
]);

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getSearchTokens(query: string) {
  return Array.from(
    new Set(
      normalize(query)
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token))
    )
  );
}

function buildCandidates(): SearchCandidate[] {
  return [
    ...onlineToolLandingPages.map((page) => ({
      id: `online:${page.slug}`,
      href: page.path,
      title: page.title,
      description: page.metaDescription,
      type: "Hub" as const,
      keywords: page.keywords,
      body: `${page.heading} ${page.intro} ${page.sections.map((section) => `${section.heading} ${section.body.join(" ")}`).join(" ")}`
    })),
    ...toolSeoPages.map((page) => ({
      id: `seo-tool:${page.slug}`,
      href: `/${page.slug}`,
      title: page.title,
      description: page.metaDescription,
      type: "Guide" as const,
      keywords: page.keywords,
      body: `${page.heading} ${page.intro} ${page.sections.map((section) => `${section.heading} ${section.paragraphs.join(" ")}`).join(" ")}`
    })),
    ...seoLandingPages.map((page) => ({
      id: `landing:${page.slug}`,
      href: page.path ?? `/${page.slug}`,
      title: page.title,
      description: page.description,
      type: "Directory" as const,
      keywords: [page.title, page.eyebrow],
      body: `${page.heading} ${page.intro} ${(page.relatedLinks ?? []).map((link) => link.label).join(" ")}`
    })),
    ...blogPosts.map((post) => ({
      id: `blog:${post.slug}`,
      href: `/blog/${post.slug}`,
      title: post.title,
      description: post.metaDescription,
      type: "Blog" as const,
      keywords: post.keywords,
      body: `${post.excerpt} ${post.category} ${post.sections.map((section) => `${section.heading} ${section.paragraphs.join(" ")}`).join(" ")}`
    }))
  ];
}

function scoreCandidate(candidate: SearchCandidate, query: string, tokens: string[]) {
  const normalizedQuery = normalize(query);
  const title = normalize(candidate.title);
  const description = normalize(candidate.description);
  const href = normalize(candidate.href);
  const keywords = normalize(candidate.keywords.join(" "));
  const body = normalize(candidate.body);
  const haystack = `${title} ${description} ${href} ${keywords} ${body}`;

  if (!tokens.length || !tokens.every((token) => haystack.includes(token))) {
    return 0;
  }

  let score = 0;

  if (title.includes(normalizedQuery)) score += 80;
  if (keywords.includes(normalizedQuery)) score += 64;
  if (href.includes(normalizedQuery.replace(/\s+/g, " "))) score += 36;
  if (description.includes(normalizedQuery)) score += 28;
  if (body.includes(normalizedQuery)) score += 16;

  for (const token of tokens) {
    if (title.includes(token)) score += 12;
    if (keywords.includes(token)) score += 10;
    if (href.includes(token)) score += 8;
    if (description.includes(token)) score += 5;
    if (body.includes(token)) score += 2;
  }

  if (candidate.type === "Guide") score += 5;
  if (candidate.type === "Hub") score += 3;

  return score;
}

export function searchSiteContent(query: string, limit = 6): SiteSearchResult[] {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const tokens = getSearchTokens(trimmedQuery);

  return buildCandidates()
    .map((candidate) => ({
      ...candidate,
      score: scoreCandidate(candidate, trimmedQuery, tokens)
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, limit)
    .map(({ keywords, body, ...result }) => result);
}
