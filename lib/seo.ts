import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { env } from "@/lib/env";

interface BuildMetadataInput {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  type?: "website" | "article";
  imagePath?: string;
  noIndex?: boolean;
}

const DEFAULT_KEYWORDS = [
  "ai tools finder",
  "best ai tools",
  "free online tools",
  "seo tools",
  "pdf tools",
  "image tools",
  "ai tool directory",
  "ai tool comparison",
  "no signup tools"
] as const;

export function absoluteUrl(path = "") {
  return new URL(path, siteConfig.url).toString();
}

export function getSocialImageUrl(path?: string) {
  return absoluteUrl(path ?? "/opengraph-image");
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
  imagePath,
  noIndex = false
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const image = getSocialImageUrl(imagePath);
  const normalizedTitle = title.toLowerCase().includes(siteConfig.name.toLowerCase())
    ? title
    : `${title} | ${siteConfig.name}`;
  const mergedKeywords = Array.from(
    new Set([...DEFAULT_KEYWORDS, ...(keywords ?? [])].map((keyword) => keyword.trim()).filter(Boolean))
  );
  const robots = noIndex
    ? {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true
        }
      }
    : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large" as const,
          "max-snippet": -1,
          "max-video-preview": -1
        }
      };

  return {
    title: normalizedTitle,
    description,
    keywords: mergedKeywords,
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    creator: siteConfig.name,
    publisher: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    category: "technology",
    formatDetection: {
      email: false,
      address: false,
      telephone: false
    },
    referrer: "origin-when-cross-origin",
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icon.svg", type: "image/svg+xml" }]
    },
    alternates: {
      canonical: url
    },
    verification: env.GOOGLE_SITE_VERIFICATION
      ? {
          google: env.GOOGLE_SITE_VERIFICATION
        }
      : undefined,
    robots,
    openGraph: {
      title: normalizedTitle,
      description,
      url,
      siteName: siteConfig.name,
      type,
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: normalizedTitle
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedTitle,
      description,
      images: [image],
      site: "@aitoolsfinder"
    },
    other: {
      "theme-color": "#0b1020"
    }
  };
}
