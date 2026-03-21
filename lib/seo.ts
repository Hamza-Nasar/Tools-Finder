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
    title,
    description,
    keywords,
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "technology",
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
      title,
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
          alt: title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      site: "@aitoolsfinder"
    }
  };
}
