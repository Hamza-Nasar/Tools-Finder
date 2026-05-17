"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Tool } from "@/types";
import { ToolCard } from "@/components/tools/tool-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolGridWithCompareProps {
  items: Array<{ tool: Tool; matchReason?: string }>;
}

export function ToolGridWithCompare({ items }: ToolGridWithCompareProps) {
  const [selected, setSelected] = useState<Array<{ slug: string; name: string }>>([]);

  const selectedSet = useMemo(() => new Set(selected.map((item) => item.slug)), [selected]);

  function toggleTool(tool: Tool) {
    setSelected((prev) => {
      const exists = prev.some((item) => item.slug === tool.slug);

      if (exists) {
        return prev.filter((item) => item.slug !== tool.slug);
      }

      if (prev.length >= 2) {
        return [prev[1], { slug: tool.slug, name: tool.name }];
      }

      return [...prev, { slug: tool.slug, name: tool.name }];
    });
  }

  const compareHref = selected.length === 2 ? `/compare/${selected[0].slug}-vs-${selected[1].slug}` : null;

  return (
    <TooltipProvider>
      <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map(({ tool, matchReason }) => {
          const isSelected = selectedSet.has(tool.slug);

          return (
            <ToolCard
              key={tool.id}
              tool={tool}
              matchReason={matchReason}
              compareAction={
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTool(tool)}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? "Selected" : "Add to compare"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isSelected ? "Click to remove from compare tray" : "Pick 2 tools for side-by-side comparison"}</TooltipContent>
                </Tooltip>
              }
            />
          );
        })}
      </div>

      {selected.length > 0 ? (
        <Card className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl border-white/80 bg-white/95 shadow-[0_18px_48px_rgba(15,23,42,0.22)] backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge variant="accent">Compare tray</Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selected.length === 1
                    ? `1 tool selected: ${selected[0].name}. Pick one more to compare.`
                    : `${selected[0].name} vs ${selected[1].name}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelected([])}>
                  Clear
                </Button>
                <Button asChild size="sm" disabled={!compareHref}>
                  <Link href={compareHref ?? "#"}>Compare now</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </TooltipProvider>
  );
}
