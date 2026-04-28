import type { NavItem, PricingTier } from "@/types";

export const siteConfig = {
  name: "AI Tools Finder",
  description:
    "A free online tools directory for SEO tools, PDF tools, image tools, AI workflows, and faster no-signup discovery.",
  url: (process.env.NEXT_PUBLIC_APP_URL ?? "https://tools-finder-delta.vercel.app").replace(/\/+$/, "")
};

export const mainNav: NavItem[] = [
  { label: "Directory", href: "/tools" },
  { label: "AI Finder", href: "/find-ai-tool" },
  { label: "Workflows", href: "/workflows" },
  { label: "Prompts", href: "/prompts" },
  { label: "Categories", href: "/categories" },
  { label: "Blog", href: "/blog" }
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Tools", href: "/admin/tools" },
  { label: "Submissions", href: "/admin/submissions" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Users", href: "/admin/users" }
];

export const pricingOptions = ["Free", "Freemium", "Paid"] as const satisfies readonly PricingTier[];
export const toolStatusOptions = ["draft", "pending", "approved", "rejected"] as const;
export const submissionStatusOptions = ["pending", "approved", "rejected"] as const;

export const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Most popular", value: "popular" },
  { label: "Most favorited", value: "favorited" },
  { label: "Featured", value: "featured" }
] as const;

export const categoryGradientMap: Record<string, string> = {
  writing: "from-violet-600 to-fuchsia-500",
  "image-generation": "from-orange-500 to-amber-400",
  video: "from-rose-600 to-orange-500",
  coding: "from-slate-700 to-slate-500",
  marketing: "from-cyan-600 to-teal-500",
  productivity: "from-emerald-600 to-lime-500",
  education: "from-indigo-600 to-sky-500",
  chatbots: "from-cyan-700 to-blue-500",
  research: "from-sky-700 to-blue-500",
  design: "from-pink-600 to-rose-500",
  audio: "from-amber-600 to-orange-500"
};
