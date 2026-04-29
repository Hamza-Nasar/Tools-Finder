import Link from "next/link";
import type { Tool } from "@/types";
import { SmoothImage } from "@/components/shared/smooth-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { compactNumber, getHostnameLabel } from "@/lib/utils";

function getPricingWeight(pricing: Tool["pricing"]) {
  if (pricing === "Free") {
    return 3;
  }

  if (pricing === "Freemium") {
    return 2;
  }

  return 1;
}

function getComparisonScore(tool: Tool) {
  return (
    tool.rating * 3 +
    tool.reviewCount / 40 +
    tool.favoritesCount / 120 +
    tool.viewsCount / 300 +
    tool.trendingScore / 10 +
    getPricingWeight(tool.pricing) +
    (tool.featured ? 1 : 0)
  );
}

function getProsAndCons(tool: Tool, competitor: Tool) {
  const pros: string[] = [];
  const cons: string[] = [];

  if (getPricingWeight(tool.pricing) > getPricingWeight(competitor.pricing)) {
    pros.push(`More accessible pricing with a ${tool.pricing.toLowerCase()} entry point.`);
  }

  if (tool.favoritesCount >= competitor.favoritesCount) {
    pros.push("Stronger save count, suggesting more shortlist momentum.");
  } else {
    cons.push("Lower save count than the competing option.");
  }

  if (tool.reviewCount >= competitor.reviewCount) {
    pros.push("More review depth for social proof and buyer confidence.");
  } else {
    cons.push("Fewer reviews, so there is less public validation.");
  }

  if (tool.tags.length >= competitor.tags.length) {
    pros.push("Broader use-case coverage across its tag footprint.");
  } else {
    cons.push("Narrower tag coverage than the competing tool.");
  }

  if (tool.pricing === "Paid" && competitor.pricing !== "Paid") {
    cons.push("Paid-only pricing raises the evaluation bar for new users.");
  }

  if (tool.viewsCount < competitor.viewsCount) {
    cons.push("Currently generating less traffic momentum than the other option.");
  }

  return {
    pros: pros.slice(0, 3),
    cons: cons.slice(0, 3)
  };
}

function getVerdict(toolA: Tool, toolB: Tool) {
  const scoreA = getComparisonScore(toolA);
  const scoreB = getComparisonScore(toolB);
  const diff = Math.abs(scoreA - scoreB);

  if (diff < 3) {
    return `Both tools are competitive. Choose ${toolA.name} if you want ${toolA.pricing.toLowerCase()} access and ${toolA.tags
      .slice(0, 2)
      .join(", ")}, or choose ${toolB.name} if ${toolB.tags.slice(0, 2).join(", ")} fits your workflow better.`;
  }

  const winner = scoreA > scoreB ? toolA : toolB;
  const runnerUp = winner.id === toolA.id ? toolB : toolA;

  return `${winner.name} edges ahead overall thanks to stronger discovery signals and a more compelling balance of pricing, adoption, and community proof. ${runnerUp.name} is still a solid choice if its tag focus better matches your exact workflow.`;
}

function getFeatureRows(toolA: Tool, toolB: Tool) {
  const tagRows = Array.from(new Set([...toolA.tags, ...toolB.tags])).slice(0, 6);

  return [
    {
      label: "Category",
      a: toolA.category,
      b: toolB.category
    },
    {
      label: "Launch year",
      a: toolA.launchYear ? String(toolA.launchYear) : "Not listed",
      b: toolB.launchYear ? String(toolB.launchYear) : "Not listed"
    },
    {
      label: "Pricing",
      a: toolA.pricing,
      b: toolB.pricing
    },
    {
      label: "Login required",
      a: toolA.loginRequired === true ? "Yes" : toolA.loginRequired === false ? "No" : "Unknown",
      b: toolB.loginRequired === true ? "Yes" : toolB.loginRequired === false ? "No" : "Unknown"
    },
    {
      label: "Skill level",
      a: toolA.skillLevel ?? "Unknown",
      b: toolB.skillLevel ?? "Unknown"
    },
    {
      label: "Platforms",
      a: toolA.platforms?.length ? toolA.platforms.join(", ") : "Unknown",
      b: toolB.platforms?.length ? toolB.platforms.join(", ") : "Unknown"
    },
    {
      label: "Rating",
      a: toolA.rating.toFixed(1),
      b: toolB.rating.toFixed(1)
    },
    {
      label: "Reviews",
      a: compactNumber(toolA.reviewCount),
      b: compactNumber(toolB.reviewCount)
    },
    {
      label: "Saves",
      a: compactNumber(toolA.favoritesCount),
      b: compactNumber(toolB.favoritesCount)
    },
    {
      label: "Views",
      a: compactNumber(toolA.viewsCount),
      b: compactNumber(toolB.viewsCount)
    },
    ...tagRows.map((tag) => ({
      label: tag,
      a: toolA.tags.includes(tag) ? "Included" : "Not highlighted",
      b: toolB.tags.includes(tag) ? "Included" : "Not highlighted"
    }))
  ];
}

function ToolSummaryCard({ tool }: { tool: Tool }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
        <div className="flex items-start gap-4">
          {tool.logo ? (
            <div className="overflow-hidden rounded-[1.2rem] border border-white/80 bg-white/90 p-2 shadow-sm">
              <SmoothImage
                src={tool.logo}
                alt={`${tool.name} logo`}
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl object-contain"
              />
            </div>
          ) : (
            <div
              className={`grid h-14 w-14 place-items-center rounded-[1.2rem] bg-gradient-to-br ${tool.logoBackground} font-[family-name:var(--font-heading)] text-lg font-bold text-white shadow-sm`}
            >
              {tool.logoText}
            </div>
          )}
          <div className="min-w-0">
            <CardTitle>{tool.name}</CardTitle>
            <CardDescription className="mt-2">{tool.tagline}</CardDescription>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="muted">{tool.category}</Badge>
              <Badge variant={tool.featured ? "accent" : "default"}>{tool.pricing}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <p className="text-sm leading-6 text-muted-foreground">{tool.description}</p>
        <div className="flex flex-wrap gap-2">
          {tool.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.1rem] border border-border/70 bg-white/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">Rating</p>
            <p className="mt-2 font-semibold">{tool.rating.toFixed(1)}</p>
          </div>
          <div className="rounded-[1.1rem] border border-border/70 bg-white/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">Saves</p>
            <p className="mt-2 font-semibold">{compactNumber(tool.favoritesCount)}</p>
          </div>
          <div className="rounded-[1.1rem] border border-border/70 bg-white/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">Website</p>
            <p className="mt-2 truncate font-semibold">{getHostnameLabel(tool.website)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild className="flex-1">
            <Link href={`/tools/${tool.slug}`}>View details</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/go/${tool.slug}`} target="_blank" rel="noreferrer">
              Visit website
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ToolComparison({ toolA, toolB }: { toolA: Tool; toolB: Tool }) {
  const featureRows = getFeatureRows(toolA, toolB);
  const toolAInsights = getProsAndCons(toolA, toolB);
  const toolBInsights = getProsAndCons(toolB, toolA);
  const verdict = getVerdict(toolA, toolB);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-2">
        <ToolSummaryCard tool={toolA} />
        <ToolSummaryCard tool={toolB} />
      </div>

      <Card>
        <CardHeader className="border-b border-border/70">
          <CardTitle>Feature comparison</CardTitle>
          <CardDescription>
            A side-by-side read on pricing, category fit, adoption signals, and highlighted capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-6">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/70 text-muted-foreground">
                <th className="px-4 py-3 font-medium">Signal</th>
                <th className="px-4 py-3 font-medium">{toolA.name}</th>
                <th className="px-4 py-3 font-medium">{toolB.name}</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row) => (
                <tr key={row.label} className="border-b border-border/50 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.a}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border/70">
            <CardTitle>{toolA.name} pros and cons</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Pros</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                {toolAInsights.pros.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Cons</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                {toolAInsights.cons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border/70">
            <CardTitle>{toolB.name} pros and cons</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Pros</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                {toolBInsights.pros.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Cons</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                {toolBInsights.cons.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="hero-mesh border-b border-border/70">
          <CardTitle>Quick verdict</CardTitle>
          <CardDescription>
            A concise recommendation based on pricing accessibility, adoption, and current discovery momentum.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-base leading-8 text-muted-foreground">{verdict}</p>
        </CardContent>
      </Card>
    </div>
  );
}
