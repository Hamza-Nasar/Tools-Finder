export type PricingTier = "Free" | "Freemium" | "Paid";
export type UserRole = "user" | "admin";
export type ToolStatus = "draft" | "pending" | "approved" | "rejected";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type ToolSort = "newest" | "popular" | "favorited" | "featured";
export type FeatureSource = "manual" | "stripe";
export type SearchResultSource = "local" | "web";
export type ExternalDiscoveryProvider = "futurepedia" | "theresanaiforthat" | "github" | "producthunt";

export interface NavItem {
  label: string;
  href: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  toolCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  website: string;
  affiliateUrl?: string | null;
  categoryId: string;
  category: string;
  categorySlug: string;
  tags: string[];
  pricing: PricingTier;
  featured: boolean;
  status: ToolStatus;
  logo?: string | null;
  logoText: string;
  logoBackground: string;
  screenshots: string[];
  createdAt: string;
  updatedAt?: string;
  trendingScore: number;
  rating: number;
  reviewCount: number;
  favoritesCount: number;
  viewsCount: number;
  clicksCount: number;
  latestFavoriteAt?: string | null;
  latestViewAt?: string | null;
  latestClickAt?: string | null;
  featuredUntil?: string | null;
  featureSource?: FeatureSource | null;
  createdBy?: string | null;
}

export interface ToolQuery {
  q?: string;
  category?: string;
  tags?: string[];
  pricing?: PricingTier;
  featured?: boolean;
  recent?: boolean;
  sort?: ToolSort;
  page?: number;
  limit?: number;
}

export interface ToolSubmissionPayload {
  name: string;
  tagline: string;
  website: string;
  affiliateUrl?: string | null;
  description: string;
  category: string;
  tags: string[];
  pricing: PricingTier;
  logo?: string;
  screenshots: string[];
  status: SubmissionStatus;
}

export interface Submission {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  website: string;
  affiliateUrl?: string | null;
  description: string;
  categoryId: string;
  category: string;
  categorySlug: string;
  tags: string[];
  pricing: PricingTier;
  logo?: string | null;
  screenshots: string[];
  status: SubmissionStatus;
  moderationNote?: string | null;
  contactEmail?: string | null;
  approvedToolId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  toolId: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ToolSuggestion {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  pricing: PricingTier;
  featured: boolean;
}

export interface TagFacet {
  tag: string;
  count: number;
}

export interface ToolDirectoryFacets {
  topTags: TagFacet[];
}

export interface LocalSearchTool extends Tool {
  source: "local";
}

export interface WebDiscoveredTool {
  id: string;
  slug: string;
  source: "web";
  provider: ExternalDiscoveryProvider;
  name: string;
  tagline: string;
  description: string;
  website: string;
  websiteDomain?: string | null;
  category: string;
  categorySlug: string;
  tags: string[];
  pricing: PricingTier;
  logo?: string | null;
  logoText: string;
  logoBackground: string;
  directoryUrl?: string | null;
  popularityScore: number;
  featured?: boolean;
  importedToolSlug?: string | null;
}

export interface HybridSearchLocalPayload {
  results: LocalSearchTool[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HybridSearchProviderStatus {
  provider: ExternalDiscoveryProvider;
  count: number;
  cached?: boolean;
  error?: string;
}

export interface HybridSearchWebPayload {
  results: WebDiscoveredTool[];
  cached: boolean;
  providers: HybridSearchProviderStatus[];
}

export interface RevenueMetric {
  currency: string;
  totalRevenue: number;
  paidFeaturedListings: number;
  activeFeaturedListings: number;
}

export interface AnalyticsPoint {
  label: string;
  value: number;
}
