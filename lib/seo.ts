import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";

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

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteConfig.url),
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icon.svg", type: "image/svg+xml" }]
    },
    alternates: {
      canonical: url
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
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
      images: [image]
    }
  };
}
