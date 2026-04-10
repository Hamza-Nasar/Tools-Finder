import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

type PricingTier = "Free" | "Freemium" | "Paid";

interface CliOptions {
  dryRun: boolean;
  help: boolean;
  perSourceLimit: number;
  targetTotal: number;
}

interface CategoryDefinition {
  name: string;
  slug: string;
  description: string;
}

interface RawToolCandidate {
  source: string;
  sourcePriority: number;
  sourceUrl: string;
  name: string;
  website: string;
  tagline?: string | null;
  description?: string | null;
  categoryHint?: string | null;
  tags?: string[];
  pricing?: PricingTier | null;
  pricingHint?: string | null;
  logo?: string | null;
}

interface PreparedToolCandidate {
  source: string;
  sourceUrl: string;
  name: string;
  website: string;
  websiteDomain: string;
  tagline: string;
  description: string;
  categorySlug: string;
  tags: string[];
  pricing: PricingTier;
  logo: string | null;
  score: number;
}

interface WebsiteMetadata {
  resolvedUrl: string;
  name: string | null;
  description: string | null;
  tagline: string | null;
  logo: string | null;
  keywords: string[];
  text: string;
}

interface GitHubMarkdownSource {
  name: string;
  priority: number;
  urls: string[];
  maxCandidates: number;
}

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_TARGET_TOTAL = 250;
const MINIMUM_REQUIRED_TOTAL = 200;
const DEFAULT_PER_SOURCE_LIMIT = 160;
const SOURCE_FETCH_CONCURRENCY = 4;
const WEBSITE_FETCH_CONCURRENCY = 6;
const IMPORTER_EMAIL = "importer@ai-tools-finder.local";
const IMPORTER_NAME = "AI Tools Importer";
const USER_AGENT = "AI Tools Finder Importer/1.0 (+https://ai-tools-finder.local)";

const canonicalCategories: CategoryDefinition[] = [
  {
    name: "Writing",
    slug: "writing",
    description: "AI tools for writing, editing, summarizing, and content generation."
  },
  {
    name: "Image Generation",
    slug: "image-generation",
    description: "AI tools for generating, editing, and enhancing images and artwork."
  },
  {
    name: "Video",
    slug: "video",
    description: "AI tools for video generation, editing, avatars, and production workflows."
  },
  {
    name: "Coding",
    slug: "coding",
    description: "AI tools for coding, debugging, code review, and developer productivity."
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "AI tools for marketing, SEO, growth, advertising, and sales workflows."
  },
  {
    name: "Productivity",
    slug: "productivity",
    description: "AI tools for productivity, notes, meetings, automation, and general workflows."
  },
  {
    name: "Audio",
    slug: "audio",
    description: "AI tools for music, speech, transcription, dubbing, and voice generation."
  },
  {
    name: "Research",
    slug: "research",
    description: "AI tools for search, research, analytics, learning, and knowledge work."
  },
  {
    name: "Design",
    slug: "design",
    description: "AI tools for design systems, UI, graphics, presentations, and creative assets."
  },
  {
    name: "Chatbots",
    slug: "chatbots",
    description: "AI chatbots, virtual assistants, and conversational AI platforms."
  }
];

const githubMarkdownSources: GitHubMarkdownSource[] = [
  {
    name: "tankvn/awesome-ai-tools",
    priority: 82,
    urls: [
      "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/main/README.md",
      "https://raw.githubusercontent.com/tankvn/awesome-ai-tools/master/README.md"
    ],
    maxCandidates: 220
  },
  {
    name: "pingan8787/awesome-ai-tools",
    priority: 78,
    urls: [
      "https://raw.githubusercontent.com/pingan8787/awesome-ai-tools/main/README.md",
      "https://raw.githubusercontent.com/pingan8787/awesome-ai-tools/master/README.md"
    ],
    maxCandidates: 180
  },
  {
    name: "tejasrsuthar/awesome-ai-tools",
    priority: 75,
    urls: [
      "https://raw.githubusercontent.com/tejasrsuthar/awesome-ai-tools/main/README.md",
      "https://raw.githubusercontent.com/tejasrsuthar/awesome-ai-tools/master/README.md"
    ],
    maxCandidates: 180
  },
  {
    name: "cloudcommunity/AI-Tools",
    priority: 72,
    urls: [
      "https://raw.githubusercontent.com/cloudcommunity/AI-Tools/main/README.md",
      "https://raw.githubusercontent.com/cloudcommunity/AI-Tools/master/README.md"
    ],
    maxCandidates: 140
  },
  {
    name: "aliammari1/Awesome-Ai-Tools",
    priority: 68,
    urls: [
      "https://raw.githubusercontent.com/aliammari1/Awesome-Ai-Tools/main/README.md",
      "https://raw.githubusercontent.com/aliammari1/Awesome-Ai-Tools/master/README.md"
    ],
    maxCandidates: 160
  },
  {
    name: "ikaijua/Awesome-AITools",
    priority: 64,
    urls: [
      "https://raw.githubusercontent.com/ikaijua/Awesome-AITools/main/README.md",
      "https://raw.githubusercontent.com/ikaijua/Awesome-AITools/master/README.md"
    ],
    maxCandidates: 180
  }
];

const futurepediaSeedPages = [
  "https://www.futurepedia.io",
  "https://www.futurepedia.io/ai-tools",
  "https://www.futurepedia.io/ai-tools/productivity",
  "https://www.futurepedia.io/ai-tools/marketing",
  "https://www.futurepedia.io/ai-tools/design",
  "https://www.futurepedia.io/ai-tools/video",
  "https://www.futurepedia.io/ai-tools/research",
  "https://www.futurepedia.io/ai-tools/audio"
];

const ignoredHeadingKeywords = [
  "table of contents",
  "contents",
  "contributing",
  "license",
  "resources",
  "resource",
  "newsletter",
  "learning",
  "tutorial",
  "news",
  "community",
  "faq",
  "dataset",
  "datasets",
  "papers",
  "books"
];

const ignoredNameKeywords = ["awesome", "curated list", "directory", "newsletter", "resource"];

const htmlCache = new Map<string, Promise<{ html: string; resolvedUrl: string } | null>>();
const metadataCache = new Map<string, Promise<WebsiteMetadata | null>>();

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    help: false,
    perSourceLimit: DEFAULT_PER_SOURCE_LIMIT,
    targetTotal: DEFAULT_TARGET_TOTAL
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg.startsWith("--target-total=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) {
        options.targetTotal = Math.floor(value);
      }
      continue;
    }

    if (arg.startsWith("--per-source-limit=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) {
        options.perSourceLimit = Math.floor(value);
      }
    }
  }

  return options;
}

function printUsage() {
  console.log(`
Usage:
  npm run import-tools
  npm run import-tools -- --dry-run
  npm run import-tools -- --target-total=300 --per-source-limit=200

Options:
  --dry-run            Fetch, normalize, and validate candidates without inserting them
  --target-total=N     Stop when approved tools in MongoDB reach N (default: ${DEFAULT_TARGET_TOTAL})
  --per-source-limit=N Cap the number of raw candidates kept from each source (default: ${DEFAULT_PER_SOURCE_LIMIT})
`.trim());
}

async function loadEnvironmentFiles(root: string) {
  for (const relativePath of [".env.local", ".env"]) {
    const filePath = path.join(root, relativePath);

    try {
      const content = await readFile(filePath, "utf8");
      applyEnvContent(content);
    } catch {
      continue;
    }
  }
}

function applyEnvContent(content: string) {
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: "\""
  };

  return value
    .replace(/&([a-z]+);/gi, (match, entity) => named[entity.toLowerCase()] ?? match)
    .replace(/&#(\d+);/g, (_, valueAsString) => String.fromCharCode(Number(valueAsString)))
    .replace(/&#x([0-9a-f]+);/gi, (_, valueAsString) => String.fromCharCode(Number.parseInt(valueAsString, 16)));
}

function stripMarkdown(value: string) {
  return normalizeWhitespace(
    decodeHtmlEntities(
      value
        .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
        .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1")
        .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
        .replace(/[*_~>#]+/g, " ")
    )
  );
}

function stripHtml(value: string) {
  return normalizeWhitespace(
    decodeHtmlEntities(
      value
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
    )
  );
}

function normalizeWebsiteUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const withProtocol = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    url.hash = "";
    return url.toString();
  } catch {
    return trimmed;
  }
}

function extractWebsiteDomain(input: string) {
  const normalized = normalizeWebsiteUrl(input);

  if (!normalized) {
    return null;
  }

  try {
    return new URL(normalized).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

function toAbsoluteUrl(candidate: string, baseUrl: string) {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return candidate;
  }
}

function truncateText(value: string, maxLength: number) {
  const trimmed = normalizeWhitespace(value);

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function firstSentence(value: string, maxLength: number) {
  const normalized = normalizeWhitespace(value);
  const sentence = normalized.match(/^(.+?[.!?])(?:\s|$)/)?.[1] ?? normalized;
  return truncateText(sentence, maxLength);
}

function inferPricing(value: string | null | undefined): PricingTier {
  const text = (value ?? "").toLowerCase();

  if (!text) {
    return "Freemium";
  }

  const hasFree = /\bfree\b|free tier|free plan|open source|🆓/.test(text);
  const hasFreemium = /\bfreemium\b|free trial|trial|🆓\/💰/.test(text);
  const hasPaid = /\bpaid\b|subscription|starting at|\$\d|enterprise|premium|💰/.test(text);

  if ((hasFree && hasPaid) || hasFreemium) {
    return "Freemium";
  }

  if (hasPaid) {
    return "Paid";
  }

  if (hasFree) {
    return "Free";
  }

  return "Freemium";
}

function sanitizeCandidateName(value: string) {
  return normalizeWhitespace(
    stripMarkdown(value)
      .replace(/\s+\|\s+.*$/g, "")
      .replace(/\s+[/-]\s+.*$/g, "")
  );
}

function normalizeTag(token: string) {
  return stripMarkdown(token).toLowerCase().replace(/[^a-z0-9+\s-]/g, "").trim();
}

function dedupeTags(values: string[], limit = 8) {
  const unique = new Set<string>();

  for (const value of values) {
    const normalized = normalizeTag(value);

    if (!normalized || normalized.length < 2) {
      continue;
    }

    unique.add(normalized);

    if (unique.size >= limit) {
      break;
    }
  }

  return Array.from(unique);
}

function looksLikeIgnoredHeading(value: string) {
  const normalized = stripMarkdown(value).toLowerCase();
  return ignoredHeadingKeywords.some((keyword) => normalized.includes(keyword));
}

function looksLikeIgnoredCandidate(name: string, website: string) {
  const normalizedName = name.toLowerCase();

  if (ignoredNameKeywords.some((keyword) => normalizedName.includes(keyword))) {
    return true;
  }

  const domain = extractWebsiteDomain(website);
  return domain === "github.com" && /\/(issues|pull|compare|tree|blob)\//.test(website);
}

async function fetchText(url: string, timeoutMs = 12000) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html, text/plain;q=0.9, application/xhtml+xml;q=0.8"
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return {
    html: await response.text(),
    resolvedUrl: response.url
  };
}

async function fetchTextWithFallbacks(urls: string[]) {
  let lastError: unknown = null;

  for (const url of urls) {
    try {
      return await fetchText(url);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to fetch source.");
}

async function fetchCachedHtml(url: string) {
  const normalized = normalizeWebsiteUrl(url);

  if (!normalized) {
    return null;
  }

  const existing = htmlCache.get(normalized);

  if (existing) {
    return existing;
  }

  const promise = fetchText(normalized).catch(() => null);
  htmlCache.set(normalized, promise);
  return promise;
}

function extractMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escapeRegExp(key)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escapeRegExp(key)}["'][^>]*>`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtmlEntities(match[1]).trim();
    }
  }

  return null;
}

function extractLinkHref(html: string, relToken: string) {
  const patterns = [
    new RegExp(`<link[^>]+rel=["'][^"']*${escapeRegExp(relToken)}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${escapeRegExp(relToken)}[^"']*["'][^>]*>`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtmlEntities(match[1]).trim();
    }
  }

  return null;
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? stripHtml(match[1]) : null;
}

function extractJsonLdObjects(html: string) {
  const blocks = Array.from(
    html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  );
  const objects: Record<string, unknown>[] = [];

  for (const block of blocks) {
    const content = block[1]?.trim();

    if (!content) {
      continue;
    }

    try {
      const parsed = JSON.parse(content) as unknown;
      const values = Array.isArray(parsed) ? parsed : [parsed];

      for (const value of values) {
        if (value && typeof value === "object") {
          objects.push(value as Record<string, unknown>);
        }
      }
    } catch {
      continue;
    }
  }

  return objects;
}

async function fetchWebsiteMetadata(url: string): Promise<WebsiteMetadata | null> {
  const normalized = normalizeWebsiteUrl(url);

  if (!normalized) {
    return null;
  }

  const existing = metadataCache.get(normalized);

  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const response = await fetchCachedHtml(normalized);

    if (!response) {
      return null;
    }

    const text = stripHtml(response.html);
    const jsonLdObjects = extractJsonLdObjects(response.html);
    const primaryJsonLd = jsonLdObjects.find((item) => item.name || item.description || item.image);
    const name =
      sanitizeCandidateName(
        String(
          primaryJsonLd?.name ??
            extractMetaContent(response.html, "og:site_name") ??
            extractMetaContent(response.html, "og:title") ??
            extractTitle(response.html) ??
            ""
        )
      ) || null;
    const description =
      normalizeWhitespace(
        String(
          primaryJsonLd?.description ??
            extractMetaContent(response.html, "description") ??
            extractMetaContent(response.html, "og:description") ??
            extractMetaContent(response.html, "twitter:description") ??
            ""
        )
      ) || null;
    const imageValue =
      String(
        primaryJsonLd?.image ??
          extractMetaContent(response.html, "og:image") ??
          extractMetaContent(response.html, "twitter:image") ??
          extractLinkHref(response.html, "apple-touch-icon") ??
          extractLinkHref(response.html, "icon") ??
          ""
      ) || null;
    const keywords = String(extractMetaContent(response.html, "keywords") ?? "")
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);

    return {
      resolvedUrl: response.resolvedUrl,
      name,
      description,
      tagline: description ? firstSentence(description, 90) : null,
      logo: imageValue ? toAbsoluteUrl(imageValue, response.resolvedUrl) : null,
      keywords,
      text
    };
  })().catch(() => null);

  metadataCache.set(normalized, promise);
  return promise;
}

function extractFirstUrl(value: string) {
  const httpMatch = value.match(/https?:\/\/[^\s)]+/i);

  if (httpMatch) {
    return httpMatch[0].replace(/[.,]+$/, "");
  }

  const domainMatch = value.match(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)]*)?/i);
  return domainMatch?.[0]?.replace(/[.,]+$/, "") ?? null;
}

function parseMarkdownListItem(
  content: string,
  sourceName: string,
  sourcePriority: number,
  sourceUrl: string,
  categoryHint: string | null
): RawToolCandidate | null {
  const cleaned = content.replace(/^\[[ xX]\]\s+/, "").trim();
  const markdownLinkMatch = cleaned.match(/\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/i);
  const fallbackUrl = extractFirstUrl(cleaned);
  const website = normalizeWebsiteUrl(markdownLinkMatch?.[2] ?? fallbackUrl ?? "");

  if (!website) {
    return null;
  }

  let name = markdownLinkMatch?.[1] ?? "";
  let description = cleaned;

  if (markdownLinkMatch) {
    description = description.replace(markdownLinkMatch[0], " ").trim();
  }

  if (!name) {
    const beforeSeparator = cleaned.split(/\s[-:–—]\s/, 2)[0] ?? "";
    name = beforeSeparator || extractWebsiteDomain(website) || "";
  }

  description = stripMarkdown(description.replace(website, " ").replace(/^[-:–—]\s*/, ""));
  name = sanitizeCandidateName(name);

  if (!name || looksLikeIgnoredCandidate(name, website)) {
    return null;
  }

  return {
    source: sourceName,
    sourcePriority,
    sourceUrl,
    name,
    website,
    description: description || null,
    categoryHint,
    pricing: inferPricing(description || ""),
    pricingHint: description || null,
    tags: categoryHint ? dedupeTags(categoryHint.split(/[>/,&]/g)) : []
  };
}

function parseMarkdownTableRow(
  line: string,
  sourceName: string,
  sourcePriority: number,
  sourceUrl: string,
  categoryHint: string | null
) {
  if (!line.startsWith("|") || !line.endsWith("|")) {
    return null;
  }

  const cells = line
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);

  if (cells.length < 2 || cells.every((cell) => /^-+$/.test(cell))) {
    return null;
  }

  const combined = cells.join(" - ");
  return parseMarkdownListItem(combined, sourceName, sourcePriority, sourceUrl, categoryHint);
}

function currentHeading(stack: string[]) {
  const meaningful = stack.filter(Boolean).filter((item) => !looksLikeIgnoredHeading(item));
  return meaningful.length ? meaningful[meaningful.length - 1] : null;
}

function parseMarkdownSource(
  markdown: string,
  source: GitHubMarkdownSource,
  perSourceLimit: number,
  sourceUrl: string
) {
  const headingStack: string[] = [];
  const candidates: RawToolCandidate[] = [];

  for (const rawLine of markdown.split(/\r?\n/)) {
    if (candidates.length >= Math.min(source.maxCandidates, perSourceLimit)) {
      break;
    }

    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = stripMarkdown(headingMatch[2].replace(/^\d+[\.)]?\s*/, ""));
      headingStack[level - 1] = headingText;
      headingStack.length = level;
      continue;
    }

    const listMatch = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.+)$/);

    if (listMatch) {
      const candidate = parseMarkdownListItem(
        listMatch[1],
        source.name,
        source.priority,
        sourceUrl,
        currentHeading(headingStack)
      );

      if (candidate) {
        candidates.push(candidate);
      }

      continue;
    }

    const tableCandidate = parseMarkdownTableRow(
      line,
      source.name,
      source.priority,
      sourceUrl,
      currentHeading(headingStack)
    );

    if (tableCandidate) {
      candidates.push(tableCandidate);
    }
  }

  return candidates;
}

async function collectGitHubMarkdownCandidates(perSourceLimit: number) {
  const results = await mapWithConcurrency(githubMarkdownSources, SOURCE_FETCH_CONCURRENCY, async (source) => {
    try {
      const response = await fetchTextWithFallbacks(source.urls);
      const parsed = parseMarkdownSource(response.html, source, perSourceLimit, response.resolvedUrl);
      console.log(`Fetched ${parsed.length} candidates from ${source.name}.`);
      return parsed;
    } catch (error) {
      console.warn(`Skipped ${source.name}: ${error instanceof Error ? error.message : "unknown error"}`);
      return [];
    }
  });

  return results.flat();
}

function extractFuturepediaToolUrls(html: string, sourceUrl: string) {
  const urls = new Set<string>();

  for (const match of html.matchAll(/href=["'](\/tool\/[^"'?#]+)["']/gi)) {
    urls.add(toAbsoluteUrl(match[1], sourceUrl));
  }

  return Array.from(urls);
}

function extractFuturepediaVisitSite(html: string, pageUrl: string) {
  const anchoredMatch =
    html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>\s*Visit Site\s*<\/a>/i) ??
    html.match(/Visit Site[\s\S]{0,250}?href=["']([^"']+)["']/i);

  if (!anchoredMatch?.[1]) {
    return null;
  }

  return toAbsoluteUrl(anchoredMatch[1], pageUrl);
}

function extractFuturepediaCategories(text: string) {
  const match = text.match(/AI Categories:\s*(.+?)\s*(Pricing Model:|Follow:|Updated\s)/i);

  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(/,|#/g)
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean);
}

function extractFuturepediaDescription(text: string, name: string) {
  const sectionPattern = new RegExp(
    `What is\\s+${escapeRegExp(name)}\\??\\s*(.+?)\\s*(?:Key Features:|Pros|Who is Using|Pricing:|What Makes)`,
    "i"
  );
  const sectionMatch = text.match(sectionPattern);

  if (sectionMatch?.[1]) {
    return truncateText(sectionMatch[1], 320);
  }

  return null;
}

async function parseFuturepediaToolPage(url: string): Promise<RawToolCandidate | null> {
  const response = await fetchCachedHtml(url);

  if (!response) {
    return null;
  }

  const pageText = stripHtml(response.html);
  const ogTitle = extractMetaContent(response.html, "og:title") ?? "";
  const name = sanitizeCandidateName(ogTitle.replace(/\s+AI Reviews.*$/i, "")) || "";
  const website = extractFuturepediaVisitSite(response.html, response.resolvedUrl);
  const categories = extractFuturepediaCategories(pageText);
  const pricingText = pageText.match(/Pricing Model:\s*(.+?)\s*(Follow:|What is|Updated\s)/i)?.[1] ?? null;
  const description =
    extractFuturepediaDescription(pageText, name) ??
    normalizeWhitespace(extractMetaContent(response.html, "description") ?? "");
  const tagline = description ? firstSentence(description, 90) : null;

  if (!name || !website) {
    return null;
  }

  return {
    source: "futurepedia",
    sourcePriority: 95,
    sourceUrl: response.resolvedUrl,
    name,
    website,
    tagline,
    description: truncateText(description, 320) || null,
    categoryHint: categories.join(", "),
    tags: dedupeTags(categories),
    pricing: inferPricing(pricingText),
    pricingHint: pricingText,
    logo: extractMetaContent(response.html, "og:image")
      ? toAbsoluteUrl(String(extractMetaContent(response.html, "og:image")), response.resolvedUrl)
      : null
  };
}

async function collectFuturepediaCandidates(perSourceLimit: number) {
  const pageResults = await mapWithConcurrency(futurepediaSeedPages, SOURCE_FETCH_CONCURRENCY, async (url) => {
    try {
      const response = await fetchCachedHtml(url);
      return response ? extractFuturepediaToolUrls(response.html, response.resolvedUrl) : [];
    } catch {
      return [];
    }
  });

  const toolUrls = Array.from(new Set(pageResults.flat())).slice(0, perSourceLimit);
  const tools = await mapWithConcurrency(toolUrls, SOURCE_FETCH_CONCURRENCY, async (url) => {
    try {
      return await parseFuturepediaToolPage(url);
    } catch {
      return null;
    }
  });

  const candidates = tools.filter((tool): tool is RawToolCandidate => Boolean(tool));
  console.log(`Fetched ${candidates.length} candidates from Futurepedia.`);
  return candidates;
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  handler: (value: T, index: number) => Promise<R>
) {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await handler(values[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, values.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

function buildFaviconUrl(website: string) {
  try {
    return new URL("/favicon.ico", normalizeWebsiteUrl(website)).toString();
  } catch {
    return null;
  }
}

function cleanDescription(value: string | null | undefined, fallbackName: string) {
  const normalized = normalizeWhitespace(value ?? "");

  if (!normalized) {
    return `${fallbackName} is an AI tool listed in AI Tools Finder.`;
  }

  return truncateText(normalized, 320);
}

function buildTagline(
  name: string,
  description: string,
  categorySlug: string,
  candidateTagline?: string | null,
  websiteTagline?: string | null
) {
  const preferred = normalizeWhitespace(candidateTagline ?? websiteTagline ?? "");

  if (preferred) {
    return truncateText(preferred, 90);
  }

  if (description) {
    return firstSentence(description, 90);
  }

  const categoryName = canonicalCategories.find((category) => category.slug === categorySlug)?.name ?? "AI";
  return truncateText(`${name} helps teams with ${categoryName.toLowerCase()} workflows.`, 90);
}

function scoreCategory(category: CategoryDefinition, haystack: string) {
  const keywordMap: Record<string, string[]> = {
    writing: ["writing", "copywriting", "content", "blog", "paraphras", "grammar", "email assistant", "story"],
    "image-generation": [
      "image",
      "art",
      "photo",
      "avatar",
      "illustration",
      "text to image",
      "visual",
      "stable diffusion"
    ],
    video: ["video", "animation", "avatar video", "editing", "film", "clip", "render"],
    coding: ["code", "coding", "developer", "programming", "github", "debug", "ide", "sql"],
    marketing: ["marketing", "seo", "ads", "sales", "growth", "social media", "crm", "ecommerce"],
    productivity: ["productivity", "automation", "meeting", "calendar", "workflow", "notes", "documents", "assistant"],
    audio: ["audio", "voice", "speech", "music", "podcast", "transcription", "tts", "dubbing"],
    research: ["research", "search", "knowledge", "learn", "academic", "citation", "analytics", "documents"],
    design: ["design", "ui", "ux", "presentation", "graphics", "logo", "mockup", "creative"],
    chatbots: ["chatbot", "chatbots", "conversational", "assistant", "ai agent", "customer support", "copilot"]
  };

  return (keywordMap[category.slug] ?? []).reduce((score, keyword) => {
    return score + (haystack.includes(keyword) ? 1 : 0);
  }, 0);
}

function mapCategoryToSlug(candidate: {
  name: string;
  description: string;
  categoryHint?: string | null;
  tags: string[];
}) {
  const haystack = [candidate.name, candidate.description, candidate.categoryHint ?? "", ...candidate.tags]
    .join(" ")
    .toLowerCase();
  let bestCategory = canonicalCategories.find((category) => category.slug === "productivity")!;
  let bestScore = -1;

  for (const category of canonicalCategories) {
    const score = scoreCategory(category, haystack);

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory.slug;
}

function buildTags(candidate: {
  categoryHint?: string | null;
  description: string;
  name: string;
  tags?: string[];
  websiteKeywords?: string[];
}) {
  const keywordSource = [
    ...(candidate.tags ?? []),
    ...(candidate.websiteKeywords ?? []),
    ...(candidate.categoryHint ?? "").split(/,|\/|&|>/g)
  ];
  const derived = candidate.description
    .split(/[^a-zA-Z0-9+]+/)
    .map((token) => token.toLowerCase())
    .filter((token) => token.length >= 4)
    .filter((token) => !["with", "that", "from", "this", "your", "their", "using", "help", "helps"].includes(token));

  return dedupeTags([...keywordSource, ...derived, candidate.name]);
}

function scorePreparedCandidate(candidate: PreparedToolCandidate) {
  let score = 0;

  score += candidate.logo ? 10 : 0;
  score += candidate.pricing === "Freemium" ? 6 : candidate.pricing === "Paid" ? 4 : 5;
  score += candidate.tags.length;
  score += candidate.website.includes("github.com") ? 2 : 10;
  score += candidate.description.length >= 90 ? 8 : 3;
  score += candidate.tagline.length >= 20 ? 4 : 1;

  if (candidate.source === "futurepedia") {
    score += 20;
  }

  return score;
}

async function prepareCandidate(raw: RawToolCandidate): Promise<PreparedToolCandidate | null> {
  const website = normalizeWebsiteUrl(raw.website);
  const websiteDomain = extractWebsiteDomain(website);

  if (!website || !websiteDomain) {
    return null;
  }

  const websiteMetadata = await fetchWebsiteMetadata(website);
  const resolvedWebsite = normalizeWebsiteUrl(websiteMetadata?.resolvedUrl ?? website);
  const resolvedDomain = extractWebsiteDomain(resolvedWebsite) ?? websiteDomain;
  const name = sanitizeCandidateName(raw.name || websiteMetadata?.name || resolvedDomain);

  if (!name) {
    return null;
  }

  const description = cleanDescription(raw.description || websiteMetadata?.description, name);
  const tags = buildTags({
    categoryHint: raw.categoryHint,
    description,
    name,
    tags: raw.tags,
    websiteKeywords: websiteMetadata?.keywords
  });
  const categorySlug = mapCategoryToSlug({
    name,
    description,
    categoryHint: raw.categoryHint,
    tags
  });
  const tagline = buildTagline(name, description, categorySlug, raw.tagline, websiteMetadata?.tagline);
  const logo = raw.logo ?? websiteMetadata?.logo ?? buildFaviconUrl(resolvedWebsite);
  const pricing = raw.pricing ?? inferPricing(`${raw.pricingHint ?? ""} ${websiteMetadata?.text ?? ""}`);

  const prepared: PreparedToolCandidate = {
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    name,
    website: resolvedWebsite,
    websiteDomain: resolvedDomain,
    tagline,
    description,
    categorySlug,
    tags,
    pricing,
    logo,
    score: 0
  };

  prepared.score = raw.sourcePriority + scorePreparedCandidate(prepared);
  return prepared;
}

function dedupeRawCandidates(candidates: RawToolCandidate[]) {
  const bestByIdentity = new Map<string, RawToolCandidate>();

  for (const candidate of candidates) {
    const website = normalizeWebsiteUrl(candidate.website);
    const domain = extractWebsiteDomain(website);
    const slugIdentity = sanitizeCandidateName(candidate.name).toLowerCase();
    const identity = domain ? `domain:${domain}` : `slug:${slugIdentity}`;

    if (!identity.trim()) {
      continue;
    }

    const existing = bestByIdentity.get(identity);

    if (!existing || existing.sourcePriority < candidate.sourcePriority) {
      bestByIdentity.set(identity, {
        ...candidate,
        website
      });
    }
  }

  return Array.from(bestByIdentity.values());
}

function dedupePreparedCandidates(candidates: PreparedToolCandidate[], slugify: (value: string) => string) {
  const winnersByKey = new Map<string, PreparedToolCandidate>();

  for (const candidate of candidates) {
    for (const key of [`domain:${candidate.websiteDomain}`, `slug:${slugify(candidate.name)}`]) {
      const existing = winnersByKey.get(key);

      if (!existing || existing.score < candidate.score) {
        winnersByKey.set(key, candidate);
      }
    }
  }

  return Array.from(
    new Map(
      Array.from(winnersByKey.values())
        .sort((left, right) => right.score - left.score)
        .map((candidate) => [candidate.websiteDomain, candidate])
    ).values()
  );
}

async function ensureCategories(CategoryService: typeof import("@/lib/services/category-service").CategoryService) {
  const categories = await CategoryService.listCategories({ page: 1, limit: 100 });
  const existingSlugs = new Set(categories.data.map((category) => category.slug));

  for (const category of canonicalCategories) {
    if (existingSlugs.has(category.slug)) {
      continue;
    }

    await CategoryService.createCategory(category);
    console.log(`Created missing category ${category.name}.`);
  }
}

async function ensureImporterUser(UserModel: typeof import("@/models/User").UserModel) {
  const user = await UserModel.findOneAndUpdate(
    { email: IMPORTER_EMAIL },
    {
      $setOnInsert: {
        email: IMPORTER_EMAIL,
        name: IMPORTER_NAME,
        role: "admin"
      }
    },
    {
      upsert: true,
      new: true
    }
  ).lean<{ _id: { toString(): string } } | null>();

  if (!user?._id) {
    throw new Error("Unable to create importer user.");
  }

  return user._id.toString();
}

async function backfillWebsiteDomains(model: typeof import("mongoose").Model<unknown>, label: string) {
  const records = await model
    .find({
      website: { $exists: true, $ne: null },
      $or: [{ websiteDomain: null }, { websiteDomain: "" }, { websiteDomain: { $exists: false } }]
    })
    .select({ _id: 1, website: 1 })
    .lean<Array<{ _id: unknown; website?: string | null }>>();

  const operations = records
    .map((record) => {
      const website = typeof record.website === "string" ? record.website : "";
      const websiteDomain = extractWebsiteDomain(website);

      if (!websiteDomain) {
        return null;
      }

      return {
        updateOne: {
          filter: { _id: record._id },
          update: { $set: { websiteDomain } }
        }
      };
    })
    .filter((operation): operation is NonNullable<typeof operation> => Boolean(operation));

  if (!operations.length) {
    return 0;
  }

  await model.bulkWrite(operations, { ordered: false });
  console.log(`Backfilled website domains for ${operations.length} ${label} records.`);
  return operations.length;
}

async function collectAllCandidates(perSourceLimit: number) {
  const [githubCandidates, futurepediaCandidates] = await Promise.all([
    collectGitHubMarkdownCandidates(perSourceLimit),
    collectFuturepediaCandidates(Math.min(perSourceLimit, 80))
  ]);

  return dedupeRawCandidates([...futurepediaCandidates, ...githubCandidates]);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  await loadEnvironmentFiles(workspaceRoot);

  const [
    { connectToDatabase },
    { CategoryService },
    { SubmissionService },
    { ToolModel },
    { SubmissionModel },
    { UserModel },
    { AppError },
    { slugify },
    { default: mongoose }
  ] = await Promise.all([
    import("@/lib/mongodb"),
    import("@/lib/services/category-service"),
    import("@/lib/services/submission-service"),
    import("@/models/Tool"),
    import("@/models/Submission"),
    import("@/models/User"),
    import("@/lib/errors"),
    import("@/utils/slugify"),
    import("mongoose")
  ]);

  try {
    await connectToDatabase();

    const existingApprovedCount = await ToolModel.countDocuments({ status: "approved" });
    const targetAdditional = Math.max(options.targetTotal - existingApprovedCount, 0);

    console.log(`Approved tools before import: ${existingApprovedCount}`);

    if (!options.dryRun && targetAdditional === 0) {
      console.log(`Target already met. No import needed to reach ${options.targetTotal} approved tools.`);
      return;
    }

    const rawCandidates = await collectAllCandidates(options.perSourceLimit);
    console.log(`Collected ${rawCandidates.length} unique raw candidates.`);

    const prepared = (
      await mapWithConcurrency(rawCandidates, WEBSITE_FETCH_CONCURRENCY, async (candidate) => {
        try {
          return await prepareCandidate(candidate);
        } catch {
          return null;
        }
      })
    ).filter((candidate): candidate is PreparedToolCandidate => Boolean(candidate));

    const dedupedPrepared = dedupePreparedCandidates(prepared, slugify).sort((left, right) => right.score - left.score);
    console.log(`Prepared ${dedupedPrepared.length} import-ready candidates.`);

    if (options.dryRun) {
      for (const candidate of dedupedPrepared.slice(0, 20)) {
        console.log(
          `[dry-run] ${candidate.name} | ${candidate.website} | ${candidate.categorySlug} | ${candidate.pricing} | ${candidate.tags.join(", ")}`
        );
      }

      console.log(`Dry run complete. ${dedupedPrepared.length} candidates are ready.`);
      return;
    }

    await Promise.all([
      backfillWebsiteDomains(ToolModel, "tool"),
      backfillWebsiteDomains(SubmissionModel, "submission")
    ]);
    await ensureCategories(CategoryService);

    const importerUserId = await ensureImporterUser(UserModel);
    let insertedCount = 0;
    let skippedDuplicates = 0;
    let skippedInvalid = 0;

    for (const candidate of dedupedPrepared) {
      if (insertedCount >= targetAdditional) {
        break;
      }

      try {
        const submission = await SubmissionService.createSubmission(
          {
            name: candidate.name,
            tagline: candidate.tagline,
            website: candidate.website,
            description: candidate.description,
            categorySlug: candidate.categorySlug,
            tags: candidate.tags,
            pricing: candidate.pricing,
            logo: candidate.logo,
            screenshots: [],
            contactEmail: null,
            submittedBy: importerUserId
          },
          {
            disableNotifications: true,
            skipAIAnalysis: true
          }
        );

        await SubmissionService.updateSubmission(
          submission.id,
          {
            status: "approved"
          },
          importerUserId,
          {
            disableNotifications: true,
            skipAIAnalysis: true
          }
        );

        insertedCount += 1;
        console.log(`Imported ${candidate.name} from ${candidate.source}.`);
      } catch (error) {
        if (error instanceof AppError && ["SUBMISSION_DUPLICATE", "TOOL_DUPLICATE"].includes(error.code)) {
          skippedDuplicates += 1;
          continue;
        }

        skippedInvalid += 1;
        console.warn(`Skipped ${candidate.name}: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    }

    const finalApprovedCount = await ToolModel.countDocuments({ status: "approved" });
    console.log(
      `Imported ${insertedCount} tools. Skipped duplicates: ${skippedDuplicates}. Skipped invalid: ${skippedInvalid}.`
    );
    console.log(`Approved tools after import: ${finalApprovedCount}`);

    if (finalApprovedCount < MINIMUM_REQUIRED_TOTAL) {
      throw new Error(
        `Import finished below the required threshold. Approved tools: ${finalApprovedCount}, required minimum: ${MINIMUM_REQUIRED_TOTAL}.`
      );
    }
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
