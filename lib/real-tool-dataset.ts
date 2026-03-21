import type { PricingTier } from "@/types";

export interface RealToolDatasetEntry {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  pricing: PricingTier;
  website: string;
  logo?: string | null;
  launchYear: number;
}

export interface DatasetCategoryDefinition {
  slug: string;
  name: string;
  description: string;
}

export const datasetCategories: DatasetCategoryDefinition[] = [
  {
    slug: "writing",
    name: "Writing",
    description: "AI tools for writing, editing, summarizing, and publishing content."
  },
  {
    slug: "image-generation",
    name: "Image Generation",
    description: "AI tools for image creation, editing, illustration, and visual asset generation."
  },
  {
    slug: "video",
    name: "Video",
    description: "AI tools for video generation, editing, avatar production, and visual storytelling."
  },
  {
    slug: "coding",
    name: "Coding",
    description: "AI tools for software development, debugging, code generation, and engineering workflows."
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "AI tools for campaigns, SEO, ad creative, social distribution, and growth workflows."
  },
  {
    slug: "productivity",
    name: "Productivity",
    description: "AI tools for meetings, notes, workflow automation, operations, and team productivity."
  },
  {
    slug: "education",
    name: "Education",
    description: "AI tools for tutoring, studying, lesson planning, and learning workflows."
  },
  {
    slug: "research",
    name: "Research",
    description: "AI tools for search, synthesis, analytics, knowledge work, and academic research."
  },
  {
    slug: "design",
    name: "Design",
    description: "AI tools for design systems, UI, graphics, mockups, and presentation workflows."
  },
  {
    slug: "chatbots",
    name: "Chatbots",
    description: "AI assistants, conversational interfaces, customer support agents, and chatbot builders."
  },
  {
    slug: "audio",
    name: "Audio",
    description: "AI tools for speech, transcription, dubbing, voice generation, and music workflows."
  }
];

export const knownToolLaunchYears: Record<string, number> = {
  chatgpt: 2022,
  claude: 2023,
  gemini: 2023,
  perplexity: 2022,
  midjourney: 2022,
  "dall-e": 2021,
  runway: 2018,
  "runway-gen-3": 2024,
  elevenlabs: 2023,
  "github-copilot": 2021,
  cursor: 2023,
  "replit-ai": 2023,
  codium: 2022,
  codeium: 2022,
  tabnine: 2018,
  jasper: 2021,
  "copy-ai": 2020,
  grammarly: 2009,
  notion: 2016,
  "notion-ai": 2023,
  canva: 2013,
  "canva-magic-studio": 2023,
  synthesia: 2017,
  "heygen": 2020,
  pika: 2023,
  "luma-ai": 2021,
  "stable-diffusion": 2022,
  "adobe-firefly": 2023,
  "photoroom": 2020,
  "remove-bg": 2018,
  reface: 2020,
  otter: 2016,
  descript: 2019,
  murf: 2020,
  suno: 2023,
  udio: 2024,
  "gamma-app": 2022,
  tome: 2022,
  beautiful: 2020,
  "beautiful-ai": 2018,
  loom: 2016,
  cal: 2021,
  calendly: 2013,
  zapier: 2011,
  make: 2016,
  airtable: 2012,
  clickup: 2017,
  taskade: 2017,
  "mem-ai": 2022,
  "fireflies-ai": 2019,
  "harvey-ai": 2022,
  consensus: 2022,
  scite: 2018,
  elicit: 2022,
  "semantic-scholar": 2015,
  wordtune: 2020,
  quillbot: 2017,
  sudowrite: 2020,
  writesonic: 2021,
  rytr: 2021,
  wordware: 2024,
  khanmigo: 2023,
  quizlet: 2005,
  "duolingo-max": 2023,
  "course-hero": 2006,
  "tutor-ai": 2023,
  "character-ai": 2022,
  poe: 2022,
  intercom: 2011,
  tidio: 2013,
  drift: 2015,
  manychat: 2015,
  hubspot: 2006,
  "surfer-seo": 2017,
  semrush: 2008,
  ahrefs: 2010,
  framer: 2014,
  figma: 2016,
  uizard: 2018
};

export function inferLaunchYear(input: {
  slug?: string | null;
  name?: string | null;
  launchYear?: number | null;
  createdAt?: string | Date | null;
}) {
  if (typeof input.launchYear === "number" && Number.isFinite(input.launchYear)) {
    return input.launchYear;
  }

  const normalizedSlug = (input.slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .trim();

  if (normalizedSlug && normalizedSlug in knownToolLaunchYears) {
    return knownToolLaunchYears[normalizedSlug];
  }

  const normalizedName = (input.name ?? "").toLowerCase();
  const mappedFromName = Object.entries(knownToolLaunchYears).find(([key]) => normalizedName.includes(key.replace(/-/g, " ")));

  if (mappedFromName) {
    return mappedFromName[1];
  }

  const createdAt = input.createdAt ? new Date(input.createdAt) : null;

  if (createdAt && !Number.isNaN(createdAt.getTime())) {
    return createdAt.getUTCFullYear();
  }

  return new Date().getUTCFullYear();
}
