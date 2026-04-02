import { categoryGradientMap } from "@/lib/constants";
import { env } from "@/lib/env";
import { AppError, isDatabaseUnavailableError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/mongodb";
import { sanitizeTagList, sanitizeText } from "@/lib/sanitize";
import { CategoryService } from "@/lib/services/category-service";
import { SubmissionService } from "@/lib/services/submission-service";
import { ToolService } from "@/lib/services/tool-service";
import { assertPublicHttpUrl, extractWebsiteDomain, normalizeWebsiteUrl } from "@/lib/url";
import type { ExternalSearchCacheDocument } from "@/models/ExternalSearchCache";
import { ExternalSearchCacheModel } from "@/models/ExternalSearchCache";
import { SubmissionModel } from "@/models/Submission";
import { ToolModel } from "@/models/Tool";
import type {
  ExternalDiscoveryProvider,
  HybridSearchLocalPayload,
  HybridSearchProviderStatus,
  HybridSearchWebPayload,
  PricingTier,
  ToolSort,
  WebDiscoveredTool
} from "@/types";
import { slugify } from "@/utils/slugify";

interface HybridSearchOptions {
  q: string;
  category?: string;
  tags?: string[];
  pricing?: PricingTier;
  sort?: ToolSort;
  featured?: boolean;
  recent?: boolean;
  limit: number;
}

interface SearchConnectorResult {
  provider: ExternalDiscoveryProvider;
  results: WebDiscoveredTool[];
}

interface SearchConnectorStatus extends HybridSearchProviderStatus {
  results: WebDiscoveredTool[];
}

interface WebsiteMetadata {
  title?: string | null;
  description?: string | null;
  logo?: string | null;
  screenshots: string[];
}

const DISCOVERY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_FETCH_TIMEOUT_MS = 12_000;
const GITHUB_RESULTS_LIMIT = 6;
const DIRECTORY_RESULTS_LIMIT = 8;
const PRODUCT_HUNT_RESULTS_LIMIT = 4;
const DEFAULT_EXTERNAL_LIMIT = 8;

const CATEGORY_RULES = [
  {
    slug: "writing",
    name: "Writing",
    keywords: ["writing", "copywriting", "paraphrasing", "summarizer", "story", "content", "blog", "grammar"]
  },
  {
    slug: "image-generation",
    name: "Image Generation",
    keywords: ["image", "text to image", "image editing", "photo", "art", "avatar", "illustration"]
  },
  {
    slug: "video",
    name: "Video",
    keywords: ["video", "video editing", "text to video", "subtitles", "captions", "animation", "mocap"]
  },
  {
    slug: "coding",
    name: "Coding",
    keywords: ["code", "coding", "developer", "sql", "github", "repository", "programming"]
  },
  {
    slug: "marketing",
    name: "Marketing",
    keywords: ["marketing", "seo", "sales", "social media", "brand", "ads", "campaign"]
  },
  {
    slug: "productivity",
    name: "Productivity",
    keywords: ["productivity", "workflow", "automation", "assistant", "presentations", "spreadsheet", "email"]
  },
  {
    slug: "audio",
    name: "Audio",
    keywords: ["audio", "music", "voice", "speech", "transcriber", "podcast", "text to speech"]
  },
  {
    slug: "research",
    name: "Research",
    keywords: ["research", "search", "analysis", "insight", "knowledge", "data", "study"]
  },
  {
    slug: "design",
    name: "Design",
    keywords: ["design", "ui", "ux", "logo", "creative", "mockup", "visual"]
  },
  {
    slug: "chatbots",
    name: "Chatbots",
    keywords: ["chatbot", "chatbots", "chat", "agent", "assistant", "conversation"]
  }
] as const;

const TRACKING_QUERY_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
  "ref_src",
  "referral",
  "source",
  "campaign"
]);

function withTimeout(signalMs = DEFAULT_FETCH_TIMEOUT_MS) {
  return AbortSignal.timeout(signalMs);
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/");
}

function cleanText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return sanitizeText(decodeHtmlEntities(value.replace(/\\u0026/g, "&").replace(/\\n/g, " ")));
}

function createLogoText(name: string) {
  const initials = name
    .split(/\s+/)
    .map((chunk) => chunk[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "AI";
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}…`;
}

function stripTrackingParams(url: string) {
  const normalized = normalizeWebsiteUrl(url);

  try {
    const parsed = new URL(normalized);

    for (const key of Array.from(parsed.searchParams.keys())) {
      if (TRACKING_QUERY_KEYS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
      }
    }

    parsed.hash = "";
    return parsed.toString();
  } catch {
    return normalized;
  }
}

function normalizePricing(value: string | string[] | null | undefined): PricingTier {
  const text = Array.isArray(value) ? value.join(" ") : value ?? "";
  const normalized = text.toLowerCase();

  if (!normalized) {
    return "Paid";
  }

  if (normalized.includes("free") && (normalized.includes("from $") || normalized.includes("/mo") || normalized.includes("paid"))) {
    return "Freemium";
  }

  if (normalized.includes("freemium")) {
    return "Freemium";
  }

  if (normalized.includes("free")) {
    return "Free";
  }

  return "Paid";
}

function createCategoryMatch(text: string) {
  const haystack = text.toLowerCase();
  const scoredRules = CATEGORY_RULES.map((entry) => ({
    entry,
    score: entry.keywords.reduce((total, keyword) => {
      const occurrences = haystack.split(keyword).length - 1;
      return total + Math.max(0, occurrences) * keyword.length;
    }, 0)
  }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  return scoredRules[0]?.entry ?? CATEGORY_RULES.find((entry) => entry.slug === "productivity")!;
}

function getCategoryGradient(slug: string) {
  return categoryGradientMap[slug] ?? "from-cyan-600 to-teal-500";
}

function extractMetaContent(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return resolveHtmlUrl(match[1], html) ?? cleanText(match[1]);
    }
  }

  return null;
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ? cleanText(match[1]) : null;
}

function resolveHtmlUrl(candidate: string, html: string) {
  const cleanCandidate = candidate.trim();

  if (!cleanCandidate) {
    return null;
  }

  const baseMatch = html.match(/<base[^>]*href=["']([^"']+)["']/i);
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const baseHref = baseMatch?.[1] ?? canonicalMatch?.[1];

  try {
    if (baseHref) {
      return new URL(cleanCandidate, baseHref).toString();
    }

    return normalizeWebsiteUrl(cleanCandidate);
  } catch {
    return null;
  }
}

function buildDiscoveredTool(input: {
  provider: ExternalDiscoveryProvider;
  id: string;
  name: string;
  website: string;
  tagline?: string;
  description?: string;
  category?: string;
  categorySlug?: string;
  tags?: string[];
  pricing?: string | string[] | null;
  logo?: string | null;
  directoryUrl?: string | null;
  popularityScore?: number;
  featured?: boolean;
}): WebDiscoveredTool | null {
  const cleanedWebsite = stripTrackingParams(input.website);
  const websiteDomain = extractWebsiteDomain(cleanedWebsite);

  if (!cleanedWebsite || !websiteDomain) {
    return null;
  }

  const cleanedName = cleanText(input.name);

  if (!cleanedName) {
    return null;
  }

  const cleanedTags = Array.from(
    new Set(
      sanitizeTagList([...(input.tags ?? []), input.category ?? "", input.categorySlug ?? ""]).filter(Boolean)
    )
  ).slice(0, 8);
  const combinedCategoryHint = cleanText(
    `${input.category ?? ""} ${input.categorySlug ?? ""} ${cleanedTags.join(" ")} ${input.tagline ?? ""} ${input.description ?? ""}`
  );
  const categoryRule = input.categorySlug
    ? CATEGORY_RULES.find((entry) => entry.slug === input.categorySlug)
    : null;
  const category = categoryRule ?? createCategoryMatch(combinedCategoryHint);
  const tagline = truncateText(
    cleanText(input.tagline) || truncateText(cleanText(input.description) || `${cleanedName} discovered from the web.`, 110),
    110
  );
  const description = truncateText(
    cleanText(input.description) || cleanText(input.tagline) || `${cleanedName} discovered from the web.`,
    280
  );

  return {
    id: input.id,
    slug: slugify(cleanedName),
    source: "web",
    provider: input.provider,
    name: cleanedName,
    tagline,
    description,
    website: cleanedWebsite,
    websiteDomain,
    category: category.name,
    categorySlug: category.slug,
    tags: cleanedTags.length ? cleanedTags : sanitizeTagList([category.name]),
    pricing: normalizePricing(input.pricing),
    logo: input.logo ? stripTrackingParams(input.logo) : null,
    logoText: createLogoText(cleanedName),
    logoBackground: getCategoryGradient(category.slug),
    directoryUrl: input.directoryUrl ? stripTrackingParams(input.directoryUrl) : null,
    popularityScore: Number(input.popularityScore ?? 0),
    featured: Boolean(input.featured),
    importedToolSlug: null
  };
}

function rankDiscoveredTool(tool: WebDiscoveredTool, query: string, sort: ToolSort = "popular") {
  const normalizedQuery = query.toLowerCase();
  const combined = `${tool.name} ${tool.tagline} ${tool.description} ${tool.tags.join(" ")} ${tool.category}`.toLowerCase();
  const exactNameBoost = tool.name.toLowerCase() === normalizedQuery ? 40 : tool.name.toLowerCase().includes(normalizedQuery) ? 20 : 0;
  const exactDomainBoost = tool.websiteDomain?.includes(normalizedQuery.replace(/\s+/g, "")) ? 12 : 0;
  const categoryBoost = tool.category.toLowerCase().includes(normalizedQuery) ? 8 : 0;
  const queryBoost = combined.includes(normalizedQuery) ? 6 : 0;
  const featuredBoost = tool.featured ? 10 : 0;
  const providerBoost =
    tool.provider === "futurepedia" ? 6 : tool.provider === "theresanaiforthat" ? 5 : tool.provider === "github" ? 4 : 3;
  const popularityBoost = Math.min(tool.popularityScore, 500) / 10;

  if (sort === "featured") {
    return featuredBoost * 3 + exactNameBoost + providerBoost + popularityBoost;
  }

  if (sort === "favorited") {
    return popularityBoost * 1.25 + exactNameBoost + categoryBoost + providerBoost;
  }

  if (sort === "newest") {
    return exactNameBoost + categoryBoost + providerBoost + featuredBoost;
  }

  return exactNameBoost + exactDomainBoost + categoryBoost + queryBoost + featuredBoost + providerBoost + popularityBoost;
}

function dedupeDiscoveredTools(results: WebDiscoveredTool[]) {
  const seenDomains = new Set<string>();
  const seenNames = new Set<string>();
  const deduped: WebDiscoveredTool[] = [];

  for (const result of results) {
    const nameKey = result.name.toLowerCase();
    const domainKey = result.websiteDomain ?? result.website;

    if (seenDomains.has(domainKey) || seenNames.has(nameKey)) {
      continue;
    }

    seenDomains.add(domainKey);
    seenNames.add(nameKey);
    deduped.push(result);
  }

  return deduped;
}

function applyExternalFilters(results: WebDiscoveredTool[], options: HybridSearchOptions) {
  return results.filter((result) => {
    if (options.category && result.categorySlug !== options.category) {
      return false;
    }

    if (options.pricing && result.pricing !== options.pricing) {
      return false;
    }

    if (options.featured && !result.featured) {
      return false;
    }

    if (options.tags?.length && !options.tags.every((tag) => result.tags.includes(tag.toLowerCase()))) {
      return false;
    }

    return true;
  });
}

async function fetchText(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    signal: init?.signal ?? withTimeout()
  });

  if (!response.ok) {
    throw new AppError(response.status, `Failed to fetch ${url}`, "EXTERNAL_FETCH_FAILED");
  }

  return response.text();
}

async function searchFuturepedia(query: string, limit: number): Promise<SearchConnectorResult> {
  const html = await fetchText(`https://www.futurepedia.io/search?search=${encodeURIComponent(query)}&sort=trending`, {
    headers: {
      "User-Agent": "AI-Tools-Finder/1.0"
    }
  });
  const normalizedHtml = html.replace(/\\"/g, '"');
  const matches = Array.from(normalizedHtml.matchAll(/"toolName":"([^"]+)"/g));
  const seenDomains = new Set<string>();
  const results: WebDiscoveredTool[] = [];

  for (const [index, match] of matches.entries()) {
    if (results.length >= limit) {
      break;
    }

    const matchIndex = match.index ?? -1;

    if (matchIndex < 0) {
      continue;
    }

    const name = match[1] ?? "";
    const backwardSnippet = normalizedHtml.slice(Math.max(0, matchIndex - 160), matchIndex);
    const snippet = normalizedHtml.slice(matchIndex, Math.min(normalizedHtml.length, matchIndex + 2600));
    const tagline = snippet.match(/"toolShortDescription":"([^"]*)"/)?.[1] ?? "";
    const website = snippet.match(/"websiteUrl":"([^"]+)"/)?.[1] ?? "";
    const featured = /"toolLabel":"featured"/.test(backwardSnippet);
    const rawCombined = cleanText(`${name} ${tagline}`);

    if (!rawCombined.toLowerCase().includes(query.toLowerCase())) {
      continue;
    }

    const result = buildDiscoveredTool({
      provider: "futurepedia",
      id: `futurepedia:${slugify(name)}:${index}`,
      name,
      tagline,
      description: tagline,
      website,
      tags: [],
      pricing: null,
      logo: null,
      directoryUrl: null,
      popularityScore: Math.max(0, limit - index),
      featured
    });

    if (!result || (result.websiteDomain && seenDomains.has(result.websiteDomain))) {
      continue;
    }

    if (result.websiteDomain) {
      seenDomains.add(result.websiteDomain);
    }

    results.push(result);
  }

  return {
    provider: "futurepedia",
    results
  };
}

async function searchTaaft(query: string, limit: number): Promise<SearchConnectorResult> {
  const html = await fetchText("https://theresanaiforthat.com/", {
    headers: {
      "User-Agent": "AI-Tools-Finder/1.0"
    }
  });
  const chunks = html.split('<li class="li ').slice(1);
  const results: WebDiscoveredTool[] = [];

  for (const chunk of chunks) {
    if (results.length >= limit) {
      break;
    }

    const nameMatch = chunk.match(/data-name="([^"]+)"/i);
    const websiteMatch = chunk.match(/data-url="([^"]+)"/i) ?? chunk.match(/class="external_ai_link"[^>]*href="([^"]+)"/i);
    const descriptionMatch = chunk.match(/<div class="short_desc">([\s\S]*?)<\/div>/i);
    const taskMatch =
      chunk.match(/data-task="([^"]+)"/i) ??
      chunk.match(/class="task_label"[^>]*title="([^"]+)"/i) ??
      chunk.match(/class="task_label"[^>]*>([^<]+)</i);
    const slugMatch = chunk.match(/href="(\/ai\/[^"/]+\/)"/i);
    const pricingMatch = chunk.match(/class="ai_launch_date"[^>]*>([^<]+)</i);
    const logoMatch = chunk.match(/class="taaft_icon"[^>]*src="([^"]+)"/i);

    if (!nameMatch?.[1] || !websiteMatch?.[1]) {
      continue;
    }

    const rawCombined = cleanText(`${nameMatch[1]} ${descriptionMatch?.[1] ?? ""} ${taskMatch?.[1] ?? ""}`);

    if (!rawCombined.toLowerCase().includes(query.toLowerCase())) {
      continue;
    }

    const result = buildDiscoveredTool({
      provider: "theresanaiforthat",
      id: `taaft:${slugify(nameMatch[1])}:${results.length}`,
      name: nameMatch[1],
      tagline: descriptionMatch?.[1] ?? "",
      description: descriptionMatch?.[1] ?? "",
      website: websiteMatch[1],
      category: taskMatch?.[1] ?? "",
      tags: [taskMatch?.[1] ?? ""],
      pricing: pricingMatch?.[1] ?? "",
      logo: logoMatch?.[1] ?? "",
      directoryUrl: slugMatch?.[1] ? `https://theresanaiforthat.com${slugMatch[1]}` : null,
      popularityScore: 0,
      featured: /verified/i.test(chunk)
    });

    if (result) {
      results.push(result);
    }
  }

  return {
    provider: "theresanaiforthat",
    results
  };
}

async function searchGitHub(query: string, limit: number): Promise<SearchConnectorResult> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "AI-Tools-Finder/1.0"
  };

  if (env.GITHUB_DISCOVERY_TOKEN) {
    headers.Authorization = `Bearer ${env.GITHUB_DISCOVERY_TOKEN}`;
  }

  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(`${query} topic:ai archived:false`)}&sort=stars&order=desc&per_page=${limit}`,
    {
      headers,
      signal: withTimeout()
    }
  );

  if (!response.ok) {
    throw new AppError(response.status, "GitHub discovery failed.", "GITHUB_DISCOVERY_FAILED");
  }

  const payload = (await response.json()) as {
    items?: Array<{
      id: number;
      name: string;
      full_name: string;
      description?: string | null;
      homepage?: string | null;
      html_url: string;
      topics?: string[];
      stargazers_count?: number;
      owner?: { avatar_url?: string | null };
    }>;
  };

  const results =
    payload.items
      ?.map((item) =>
        buildDiscoveredTool({
          provider: "github",
          id: `github:${item.id}`,
          name: item.name,
          tagline: item.description ?? item.full_name,
          description: item.description ?? `${item.name} repository on GitHub.`,
          website: item.homepage || item.html_url,
          category: item.topics?.join(" ") ?? "",
          tags: item.topics ?? [],
          pricing: "Free",
          logo: item.owner?.avatar_url ?? null,
          directoryUrl: item.html_url,
          popularityScore: Number(item.stargazers_count ?? 0),
          featured: false
        })
      )
      .filter((result): result is WebDiscoveredTool => Boolean(result)) ?? [];

  return {
    provider: "github",
    results
  };
}

async function searchProductHunt(query: string, limit: number): Promise<SearchConnectorResult> {
  if (!env.PRODUCT_HUNT_BEARER_TOKEN) {
    return {
      provider: "producthunt",
      results: []
    };
  }

  const response = await fetch("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.PRODUCT_HUNT_BEARER_TOKEN}`
    },
    body: JSON.stringify({
      query: `
        query HybridSearchPosts($query: String!, $first: Int!) {
          posts(first: $first, order: RANKING, topic: "Artificial Intelligence", search: $query) {
            edges {
              node {
                id
                name
                tagline
                website
                url
                votesCount
                featuredAt
                topics(first: 6) {
                  edges {
                    node {
                      name
                      slug
                    }
                  }
                }
                thumbnail {
                  url
                }
              }
            }
          }
        }
      `,
      variables: {
        query,
        first: limit
      }
    }),
    signal: withTimeout()
  });

  if (!response.ok) {
    throw new AppError(response.status, "Product Hunt discovery failed.", "PRODUCT_HUNT_DISCOVERY_FAILED");
  }

  const payload = (await response.json()) as {
    data?: {
      posts?: {
        edges?: Array<{
          node?: {
            id: string;
            name: string;
            tagline?: string | null;
            website?: string | null;
            url?: string | null;
            votesCount?: number;
            featuredAt?: string | null;
            thumbnail?: { url?: string | null } | null;
            topics?: { edges?: Array<{ node?: { name?: string | null; slug?: string | null } | null }> };
          };
        }>;
      };
    };
  };

  const edges = payload.data?.posts?.edges ?? [];
  const results = edges
    .map((edge) => edge.node)
    .filter((node): node is NonNullable<typeof node> => Boolean(node))
    .map((node) =>
      buildDiscoveredTool({
        provider: "producthunt",
        id: `producthunt:${node.id}`,
        name: node.name,
        tagline: node.tagline ?? node.name,
        description: node.tagline ?? node.name,
        website: node.website ?? node.url ?? "",
        category: node.topics?.edges?.[0]?.node?.name ?? "",
        categorySlug: node.topics?.edges?.[0]?.node?.slug ?? "",
        tags: (node.topics?.edges ?? []).map((entry) => String(entry.node?.name ?? "")),
        pricing: "Paid",
        logo: node.thumbnail?.url ?? null,
        directoryUrl: node.url ?? null,
        popularityScore: Number(node.votesCount ?? 0),
        featured: Boolean(node.featuredAt)
      })
    )
    .filter((result): result is WebDiscoveredTool => Boolean(result));

  return {
    provider: "producthunt",
    results
  };
}

async function getFreshCache(query: string) {
  try {
    await connectToDatabase();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return null;
    }

    throw error;
  }

  const cacheKey = query.trim().toLowerCase();
  const record = await ExternalSearchCacheModel.findOne({
    cacheKey,
    expiresAt: { $gt: new Date() }
  }).lean<ExternalSearchCacheDocument | null>();

  if (!record) {
    return null;
  }

  const results = (record.results ?? [])
    .map((entry) =>
      buildDiscoveredTool({
        provider: entry.provider,
        id: entry.id,
        name: entry.name,
        tagline: entry.tagline,
        description: entry.description,
        website: entry.website,
        category: entry.category,
        categorySlug: entry.categorySlug,
        tags: entry.tags,
        pricing: entry.pricing,
        logo: entry.logo,
        directoryUrl: entry.directoryUrl,
        popularityScore: entry.popularityScore,
        featured: entry.featured
      })
    )
    .filter((result): result is WebDiscoveredTool => Boolean(result));

  return {
    cached: true,
    results
  };
}

async function writeCache(query: string, results: WebDiscoveredTool[]) {
  try {
    await connectToDatabase();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return;
    }

    throw error;
  }

  const cacheKey = query.trim().toLowerCase();
  const fetchedAt = new Date();
  const expiresAt = new Date(fetchedAt.getTime() + DISCOVERY_CACHE_TTL_MS);

  await ExternalSearchCacheModel.findOneAndUpdate(
    { cacheKey },
    {
      $set: {
        query,
        fetchedAt,
        expiresAt,
        results: results.map((result) => ({
          id: result.id,
          provider: result.provider,
          name: result.name,
          slug: result.slug,
          tagline: result.tagline,
          description: result.description,
          website: result.website,
          websiteDomain: result.websiteDomain ?? null,
          category: result.category,
          categorySlug: result.categorySlug,
          tags: result.tags,
          pricing: result.pricing,
          logo: result.logo ?? null,
          directoryUrl: result.directoryUrl ?? null,
          popularityScore: result.popularityScore,
          featured: result.featured ?? false
        }))
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}

async function removeDomainsAlreadyInDatabase(results: WebDiscoveredTool[]) {
  const domains = Array.from(new Set(results.map((result) => result.websiteDomain).filter((value): value is string => Boolean(value))));

  if (!domains.length) {
    return results;
  }

  try {
    await connectToDatabase();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return results;
    }

    throw error;
  }

  const existing = await ToolModel.find({
    status: { $ne: "rejected" },
    websiteDomain: { $in: domains }
  })
    .select({ websiteDomain: 1 })
    .lean<Array<{ websiteDomain?: string | null }>>();

  const existingDomains = new Set(existing.map((item) => item.websiteDomain).filter((value): value is string => Boolean(value)));
  return results.filter((result) => !result.websiteDomain || !existingDomains.has(result.websiteDomain));
}

async function fetchWebsiteMetadata(url: string): Promise<WebsiteMetadata> {
  try {
    const html = await fetchText(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AI-Tools-Finder/1.0)"
      },
      signal: withTimeout(10_000)
    });
    const ogImage = extractMetaContent(html, [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+itemprop=["']image["'][^>]+content=["']([^"']+)["']/i
    ]);
    const iconHref = extractMetaContent(html, [
      /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i
    ]);
    const description =
      extractMetaContent(html, [
        /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
      ]) ?? "";
    const title =
      extractMetaContent(html, [
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
      ]) ?? extractTitle(html);

    const normalizedUrl = new URL(url);
    const faviconFallback = `${normalizedUrl.origin}/favicon.ico`;
    const primaryImage = ogImage ?? iconHref ?? faviconFallback;

    return {
      title: title ? cleanText(title) : null,
      description: description ? cleanText(description) : null,
      logo: primaryImage ?? faviconFallback,
      screenshots: ogImage && ogImage !== primaryImage ? [ogImage] : ogImage ? [ogImage] : []
    };
  } catch {
    return {
      title: null,
      description: null,
      logo: null,
      screenshots: []
    };
  }
}

async function resolveImportCategorySlug(input: {
  preferredCategorySlug: string;
  name: string;
  tagline: string;
  description: string;
  tags: string[];
}) {
  const categories = await CategoryService.listPublicCategories();

  if (!categories.length) {
    throw new AppError(409, "No categories are configured for imports.", "CATEGORY_REQUIRED");
  }

  const directMatch = categories.find((category) => category.slug === input.preferredCategorySlug);

  if (directMatch) {
    return directMatch.slug;
  }

  const fallbackMatch = createCategoryMatch(
    `${input.name} ${input.tagline} ${input.description} ${input.tags.join(" ")} ${input.preferredCategorySlug}`
  );
  const categoryBySlug = categories.find((category) => category.slug === fallbackMatch.slug);

  if (categoryBySlug) {
    return categoryBySlug.slug;
  }

  const categoryByName = categories.find((category) => category.name.toLowerCase() === fallbackMatch.name.toLowerCase());
  return categoryByName?.slug ?? categories[0].slug;
}

export class ToolDiscoveryService {
  static async searchLocal(options: HybridSearchOptions): Promise<HybridSearchLocalPayload> {
    try {
      const local = await ToolService.listTools({
        q: options.q,
        category: options.category,
        tags: options.tags,
        pricing: options.pricing,
        sort: options.sort,
        featured: options.featured,
        recent: options.recent,
        page: 1,
        limit: options.limit
      });

      return {
        results: local.data.map((tool) => ({
          ...tool,
          source: "local" as const
        })),
        total: local.total,
        page: local.page,
        limit: local.limit,
        totalPages: local.totalPages
      };
    } catch (error) {
      if (isDatabaseUnavailableError(error)) {
        return {
          results: [],
          total: 0,
          page: 1,
          limit: options.limit,
          totalPages: 1
        };
      }

      throw error;
    }
  }

  static async searchExternal(options: HybridSearchOptions): Promise<HybridSearchWebPayload> {
    const limit = options.limit || DEFAULT_EXTERNAL_LIMIT;
    const cached = await getFreshCache(options.q);

    if (cached) {
      const filtered = applyExternalFilters(await removeDomainsAlreadyInDatabase(cached.results), options)
        .sort((left, right) => rankDiscoveredTool(right, options.q, options.sort) - rankDiscoveredTool(left, options.q, options.sort))
        .slice(0, limit);

      const providers = ["futurepedia", "theresanaiforthat", "github", "producthunt"].map((provider) => ({
        provider: provider as ExternalDiscoveryProvider,
        count: filtered.filter((result) => result.provider === provider).length,
        cached: true
      }));

      return {
        results: filtered,
        cached: true,
        providers
      };
    }

    const connectorRuns = await Promise.allSettled([
      searchFuturepedia(options.q, DIRECTORY_RESULTS_LIMIT),
      searchTaaft(options.q, DIRECTORY_RESULTS_LIMIT),
      searchGitHub(options.q, GITHUB_RESULTS_LIMIT),
      searchProductHunt(options.q, PRODUCT_HUNT_RESULTS_LIMIT)
    ]);

    const statuses: SearchConnectorStatus[] = connectorRuns.map((result, index) => {
      const providers: ExternalDiscoveryProvider[] = ["futurepedia", "theresanaiforthat", "github", "producthunt"];
      const provider = providers[index];

      if (result.status === "fulfilled") {
        return {
          provider,
          count: result.value.results.length,
          results: result.value.results
        };
      }

      return {
        provider,
        count: 0,
        error: result.reason instanceof Error ? result.reason.message : "Connector failed.",
        results: []
      };
    });

    const merged = dedupeDiscoveredTools(statuses.flatMap((entry) => entry.results));
    const filtered = applyExternalFilters(await removeDomainsAlreadyInDatabase(merged), options)
      .sort((left, right) => rankDiscoveredTool(right, options.q, options.sort) - rankDiscoveredTool(left, options.q, options.sort))
      .slice(0, limit);

    await writeCache(options.q, merged);

    return {
      results: filtered,
      cached: false,
      providers: statuses.map(({ provider, count, error }) => ({
        provider,
        count,
        error
      }))
    };
  }

  static async importDiscoveredTool(input: {
    provider: ExternalDiscoveryProvider;
    name: string;
    tagline: string;
    description: string;
    website: string;
    categorySlug: string;
    tags: string[];
    pricing: PricingTier;
    logo?: string | null;
    directoryUrl?: string | null;
  }) {
    await connectToDatabase();

    const normalizedWebsite = await assertPublicHttpUrl(stripTrackingParams(input.website));
    const websiteDomain = extractWebsiteDomain(normalizedWebsite);
    const requestedSlug = slugify(input.name);
    const duplicateFilter = {
      status: { $ne: "rejected" },
      $or: [
        ...(websiteDomain ? [{ websiteDomain }] : []),
        { slug: requestedSlug }
      ]
    };

    const existingTool = await ToolModel.findOne(duplicateFilter)
      .select({ slug: 1 })
      .lean<{ slug?: string } | null>();

    if (existingTool?.slug) {
      return ToolService.getToolBySlug(existingTool.slug);
    }

    const existingSubmission = await SubmissionModel.findOne(duplicateFilter)
      .select({ _id: 1, slug: 1 })
      .lean<{ _id: { toString(): string }; slug?: string } | null>();

    if (existingSubmission?._id) {
      await SubmissionService.updateSubmission(
        existingSubmission._id.toString(),
        { status: "approved" },
        null,
        { disableNotifications: true }
      );

      const linkedTool = await ToolModel.findOne({
        slug: existingSubmission.slug,
        status: "approved"
      })
        .select({ slug: 1 })
        .lean<{ slug?: string } | null>();

      if (linkedTool?.slug) {
        return ToolService.getToolBySlug(linkedTool.slug);
      }
    }

    const metadata = await fetchWebsiteMetadata(normalizedWebsite);
    const tags = sanitizeTagList([
      ...input.tags,
      input.categorySlug,
      input.provider
    ]).slice(0, 8);
    const categorySlug = await resolveImportCategorySlug({
      preferredCategorySlug: input.categorySlug,
      name: input.name,
      tagline: input.tagline,
      description: `${input.description} ${metadata.description ?? ""}`,
      tags
    });
    const tagline = truncateText(
      cleanText(input.tagline) || cleanText(metadata.description) || `${cleanText(input.name)} discovered from the web.`,
      120
    );
    const description = truncateText(
      cleanText(input.description) || cleanText(metadata.description) || tagline,
      500
    );

    const submission = await SubmissionService.createSubmission(
      {
        name: cleanText(input.name) || cleanText(metadata.title) || "Discovered AI Tool",
        tagline,
        website: normalizedWebsite,
        description,
        categorySlug,
        tags: tags.length ? tags : sanitizeTagList([categorySlug]),
        pricing: input.pricing,
        logo: metadata.logo ?? input.logo ?? null,
        screenshots: metadata.screenshots,
        contactEmail: null
      },
      {
        disableNotifications: true
      }
    );

    await SubmissionService.updateSubmission(
      submission.id,
      { status: "approved" },
      null,
      { disableNotifications: true }
    );

    return ToolService.getToolBySlug(submission.slug);
  }
}
