"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { HybridSearchWebPayload, Tool, WebDiscoveredTool } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { DiscoveredToolCard } from "@/components/tools/discovered-tool-card";

export function LiveDiscoveryFeed() {
  const router = useRouter();
  const [payload, setPayload] = useState<HybridSearchWebPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importedSlugs, setImportedSlugs] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetch("/api/tools/live-feed", {
          method: "GET"
        });

        if (!response.ok) {
          throw new Error("Live discovery failed.");
        }

        const nextPayload = (await response.json()) as HybridSearchWebPayload;

        if (!active) {
          return;
        }

        setPayload(nextPayload);
        setStatus("ready");
      } catch {
        if (active) {
          setStatus("error");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function handleImport(tool: WebDiscoveredTool) {
    try {
      setImportingId(tool.id);

      const response = await fetch("/api/tools/search/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: tool.id,
          provider: tool.provider,
          name: tool.name,
          tagline: tool.tagline,
          description: tool.description,
          website: tool.website,
          category: tool.category,
          categorySlug: tool.categorySlug,
          tags: tool.tags,
          pricing: tool.pricing,
          logo: tool.logo ?? null,
          directoryUrl: tool.directoryUrl ?? null
        })
      });

      if (!response.ok) {
        throw new Error("Import failed.");
      }

      const importPayload = (await response.json()) as { data?: { tool?: Tool } };
      const slug = importPayload.data?.tool?.slug;

      if (!slug) {
        throw new Error("Imported tool slug missing.");
      }

      setImportedSlugs((current) => ({
        ...current,
        [tool.id]: slug
      }));
      router.push(`/tools/${slug}`);
    } finally {
      setImportingId(null);
    }
  }

  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Live discovery"
        title="Fresh from external AI sources"
        description="This section fetches live web results directly from external AI tool sources so the app does not depend only on MongoDB for fresh discovery."
      />

      {status === "loading" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="surface-card p-6">
              <div className="skeleton-shimmer h-12 w-12 rounded-2xl" />
              <div className="mt-4 skeleton-shimmer h-5 w-2/3 rounded-full" />
              <div className="mt-3 skeleton-shimmer h-4 w-full rounded-full" />
              <div className="mt-2 skeleton-shimmer h-4 w-5/6 rounded-full" />
              <div className="mt-6 skeleton-shimmer h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : null}

      {status === "ready" && payload?.results.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {payload.results.map((tool) => (
              <DiscoveredToolCard
                key={tool.id}
                tool={tool}
                importing={importingId === tool.id}
                importedToolSlug={importedSlugs[tool.id] ?? tool.importedToolSlug ?? null}
                onImport={handleImport}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {payload.providers.map((provider) => (
              <span key={provider.provider} className="rounded-full border border-border bg-white/70 px-3 py-1">
                {provider.provider}: {provider.count}
                {provider.cached ? " cached" : ""}
              </span>
            ))}
          </div>
        </>
      ) : null}

      {status === "ready" && !payload?.results.length ? (
        <EmptyState
          label="Live"
          title="No fresh web discoveries right now"
          description="External sources did not return any new tools beyond what is already in your directory."
        />
      ) : null}

      {status === "error" ? (
        <EmptyState
          label="Live"
          title="Live discovery is temporarily unavailable"
          description="The local directory still works, but the external source layer could not be loaded just now."
        />
      ) : null}
    </section>
  );
}
