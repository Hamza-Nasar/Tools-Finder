export type PricingTier = "Free" | "Freemium" | "Paid";
export type UserRole = "user" | "admin";
export type ToolStatus = "draft" | "pending" | "approved" | "rejected";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type ToolSort = "newest" | "popular" | "favorited" | "featured";
export type FeatureSource = "manual" | "stripe";
export type UserActivityKind = "tool_saved" | "tool_submitted" | "tool_viewed";
export type SearchResultSource = "local" | "web";
export type ExternalDiscoveryProvider = "futurepedia" | "theresanaiforthat" | "github" | "producthunt";
export type PromptCategory =
  | "Writing"
  | "Research"
  | "Design"
  | "Coding"
  | "Marketing"
  | "Productivity";

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
  launchYear?: number | null;
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
  comparisonClicksCount?: number;
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
  launchYear?: number | null;
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
  launchYear?: number | null;
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

export interface UserActivity {
  id: string;
  userId: string;
  kind: UserActivityKind;
  toolId?: string | null;
  submissionId?: string | null;
  toolName?: string | null;
  toolSlug?: string | null;
  submissionName?: string | null;
  submissionSlug?: string | null;
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

export interface ToolRecommendation {
  tool: Tool;
  score: number;
  reason: string;
  matchedCategories: string[];
  matchedTags: string[];
}

export type IntelligenceSkillLevel = "beginner" | "intermediate" | "advanced";
export type IntelligenceContext = "student" | "creator" | "developer" | "business" | "casual user";
export type IntelligenceDecisionType = "Best Single Tool" | "Best Tool Combination System";
export type IntelligenceAlternativePathName = "Beginner path" | "Pro path" | "Free-only path";

export interface IntentUnderstanding {
  statedIntent: string;
  hiddenGoal: string;
  simpleGoal: string;
  context: IntelligenceContext;
  skillLevel: IntelligenceSkillLevel;
  optimizationPriority: Array<"speed" | "simplicity" | "cost" | "efficiency">;
}

export interface ProblemDecompositionStep {
  step: number;
  phase: "ideation/input" | "creation/process" | "execution/output" | "optimization";
  objective: string;
}

export interface ToolSystemItem {
  tool: Tool;
  roleInWorkflow: string;
  whyItExists: string;
  dependencyRelation: string;
  whenToUse: string;
}

export interface SmartDecisionEngine {
  selectionType: IntelligenceDecisionType;
  winner: string;
  whyItWins: string;
  tradeoffs: string[];
  whenItFails: string[];
}

export interface WorkflowExecutionStep {
  stage: "Idea" | "Plan" | "Create" | "Enhance" | "Publish" | "Optimize";
  toolUsage: string;
  userAction: string;
  expectedOutcome: string;
}

export interface HiddenOpportunityLayer {
  improvements: string[];
  automationOpportunities: string[];
  productivityUpgrades: string[];
  scalingIdeas: string[];
}

export interface AlternativeSystemPath {
  name: IntelligenceAlternativePathName;
  tools: string[];
  workflow: string[];
  bestFor: string;
}

export interface ProductIntelligenceOutput {
  intentUnderstanding: IntentUnderstanding;
  problemDecomposition: ProblemDecompositionStep[];
  toolSystem: ToolSystemItem[];
  decisionEngine: SmartDecisionEngine;
  workflow: WorkflowExecutionStep[];
  hiddenOpportunities: HiddenOpportunityLayer;
  alternativePaths: AlternativeSystemPath[];
}

export interface PromptEntry {
  id: string;
  toolSlug: string;
  toolName: string;
  title: string;
  category: PromptCategory;
  description: string;
  prompt: string;
  featured?: boolean;
}

export interface PromptToolGroup {
  slug: string;
  toolName: string;
  description: string;
  promptCount: number;
  prompts: PromptEntry[];
}

export interface TodayToolsFeed {
  todayNew: Tool[];
  trendingToday: Tool[];
  editorPicks: Tool[];
}

export interface WorkflowStep {
  title: string;
  description: string;
  toolSlugs: string[];
}

export interface Workflow {
  slug: string;
  title: string;
  description: string;
  audience: string;
  outcome: string;
  toolsUsed: string[];
  steps: WorkflowStep[];
}

export interface UserStack {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  tools: Tool[];
  updatedAt: string;
  createdAt: string;
}

export interface FeaturedStackPreset {
  slug: string;
  title: string;
  description: string;
  audience: string;
  toolSlugs: string[];
}
