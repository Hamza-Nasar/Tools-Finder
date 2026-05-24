import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppProviders } from "@/components/layout/app-providers";
import { PageTransition } from "@/components/shared/page-transition";
import { getSafeServerSession } from "@/lib/safe-session";
import { siteConfig } from "@/lib/constants";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"]
});

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"]
});

export const metadata: Metadata = buildMetadata({
  title: "Toolverse Atlas 2026: Discover, Compare, and Choose Better AI Tools",
  description:
    "Compare top AI, SEO, PDF, and image tools with workflow-first discovery, intent-based search, and no-signup routes.",
  path: "/",
  keywords: [
    "toolverse atlas",
    "best ai tools 2026",
    "ai tools comparison",
    "find ai tools",
    "ai workflow tools",
    "free online tools"
  ]
});

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSafeServerSession();
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: siteConfig.name,
        url: siteConfig.url,
        logo: absoluteUrl("/icon.svg")
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        publisher: {
          "@id": absoluteUrl("/#organization")
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl("/tools")}?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${headingFont.variable} overflow-x-hidden font-[family-name:var(--font-body)]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
        <AppProviders session={session}>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader session={session} />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
