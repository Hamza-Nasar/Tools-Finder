"use client";

import Link from "next/link";
import { ArrowUpRight, DatabaseZap, LoaderCircle, Sparkles } from "lucide-react";
import type { WebDiscoveredTool } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getHostnameLabel } from "@/lib/utils";

interface DiscoveredToolCardProps {
  tool: WebDiscoveredTool;
  importing?: boolean;
  importedToolSlug?: string | null;
  onImport: (tool: WebDiscoveredTool) => void;
}

export function DiscoveredToolCard({
  tool,
  importing = false,
  importedToolSlug,
  onImport
}: DiscoveredToolCardProps) {
  return (
    <Card className="group surface-card-hover flex h-full flex-col overflow-hidden border-border/70">
      <CardHeader className="relative flex flex-row items-start justify-between gap-4 border-b border-border/70 bg-gradient-to-br from-white via-white to-secondary/20">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-primary/70 to-emerald-400" />
        <div className="flex gap-4">
          <div
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-[1.15rem] bg-gradient-to-br ${tool.logoBackground} font-[family-name:var(--font-heading)] text-lg font-bold text-white shadow-sm`}
          >
            {tool.logoText}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{tool.provider.replace("theresanaiforthat", "TAAFT")}</Badge>
              <Badge variant="muted">{tool.category}</Badge>
              <Badge variant="default">{tool.pricing}</Badge>
            </div>
            <p className="mt-3 truncate text-sm text-muted-foreground">{getHostnameLabel(tool.website)}</p>
          </div>
        </div>
        <Badge variant="muted">Web</Badge>
      </CardHeader>

      <CardContent className="flex-1">
        <CardTitle className="mt-4">{tool.name}</CardTitle>
        <p className="mt-2 text-base text-foreground/85">{tool.tagline}</p>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{tool.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {tool.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between rounded-[1.2rem] border border-dashed border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <DatabaseZap className="h-4 w-4 text-primary" />
            Not in your local catalog yet
          </span>
          <span className="font-medium text-foreground/80">Score {tool.popularityScore.toFixed(0)}</span>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex-col items-stretch gap-3 border-t border-border/70 bg-background/45">
        <div className="flex items-center justify-between gap-3">
          {importedToolSlug ? (
            <Button asChild size="sm">
              <Link href={`/tools/${importedToolSlug}`}>
                <Sparkles className="mr-2 h-4 w-4" />
                View imported tool
              </Link>
            </Button>
          ) : (
            <Button size="sm" onClick={() => onImport(tool)} disabled={importing}>
              {importing ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Importing
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Import to directory
                </>
              )}
            </Button>
          )}

          {tool.directoryUrl ? (
            <Button asChild variant="outline" size="sm">
              <Link href={tool.directoryUrl} target="_blank" rel="noreferrer">
                Source listing
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link href={tool.website} target="_blank" rel="noreferrer">
                Visit website
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
