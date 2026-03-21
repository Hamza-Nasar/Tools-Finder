import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/auth/", "/dashboard", "/favorites", "/submit", "/my-stack"]
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/auth/", "/dashboard", "/favorites", "/submit", "/my-stack"]
      }
    ],
    host: siteConfig.url,
    sitemap: `${siteConfig.url}/sitemap.xml`
  };
}
