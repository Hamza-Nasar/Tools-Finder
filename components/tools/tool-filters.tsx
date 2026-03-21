"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Sparkles, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Category, TagFacet, ToolSuggestion } from "@/types";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";
import { pricingOptions, sortOptions } from "@/lib/constants";
import { useToolFilters } from "@/hooks/use-tool-filters";
import { Input } from "@/components/ui/input";

interface ToolFiltersProps {
  categories: Category[];
  topTags: TagFacet[];
  resultCount: number;
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

const chipClasses =
  "rounded-full px-4 py-2 text-sm font-medium transition duration-200 hover:-translate-y-0.5 motion-safe:active:scale-[0.97]";

export function ToolFilters({ categories, topTags, resultCount }: ToolFiltersProps) {
  const router = useRouter();
  const { searchParams, updateFilters, isPending } = useToolFilters();
  const reduceMotion = useSsrSafeReducedMotion();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [tagInput, setTagInput] = useState(searchParams.get("tags") ?? searchParams.get("tag") ?? "");
  const [suggestions, setSuggestions] = useState<ToolSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const activeCategory = searchParams.get("category") ?? "";
  const activePricing = searchParams.get("pricing") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";
  const activeFeatured = searchParams.get("featured") === "true";
  const activeRecent = searchParams.get("recent") === "true";
  const activeTags = parseTags(searchParams.get("tags") ?? searchParams.get("tag") ?? "");
  const updateFiltersRef = useRef(updateFilters);

  useEffect(() => {
    updateFiltersRef.current = updateFilters;
  }, [updateFilters]);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setTagInput(searchParams.get("tags") ?? searchParams.get("tag") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const currentQuery = searchParams.get("q") ?? "";

    if (deferredQuery === currentQuery) {
      return;
    }

    updateFiltersRef.current({
      q: deferredQuery || undefined,
      page: undefined
    });
  }, [deferredQuery, searchParams]);

  useEffect(() => {
    const trimmedQuery = deferredQuery.trim();

    if (!isSearchFocused || trimmedQuery.length < 2) {
      setSuggestions([]);
      setIsSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setIsSuggestionsLoading(true);
        const response = await fetch(`/api/tools/suggestions?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const payload = (await response.json()) as { data?: { suggestions?: ToolSuggestion[] } };
        setSuggestions(payload.data?.suggestions ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSuggestionsLoading(false);
      }
    }, 150);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [deferredQuery, isSearchFocused]);

  function commitTags(nextTags: string[]) {
    const normalized = Array.from(new Set(nextTags)).slice(0, 6);
    const value = normalized.length ? normalized.join(",") : undefined;

    setTagInput(value ?? "");
    updateFilters({
      tags: value,
      tag: undefined,
      page: undefined
    });
  }

  function toggleTopTag(tag: string) {
    if (activeTags.includes(tag)) {
      commitTags(activeTags.filter((value) => value !== tag));
      return;
    }

    commitTags([...activeTags, tag]);
  }

  return (
    <div className="surface-card p-5 md:p-6">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Search and refine</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Full-text search runs across names, descriptions, tags, and categories with filters that update instantly.
          </p>
        </div>
        <div className="rounded-full border border-border bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
          {resultCount} results
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.3fr_0.85fr]">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <label className="mb-2 block text-sm font-semibold">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 150)}
                placeholder="Search tools, workflows, tags, or categories"
                className="pl-11"
              />
            </div>

            <AnimatePresence>
              {isSearchFocused && (suggestions.length > 0 || isSuggestionsLoading) ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute z-20 mt-3 w-full rounded-[1.35rem] border border-border/70 bg-white/95 p-2 shadow-floating backdrop-blur"
                >
                  {isSuggestionsLoading ? (
                    <div className="space-y-2 p-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-12 w-full rounded-[1rem]" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          onMouseDown={() => router.push(`/tools/${suggestion.slug}`)}
                          className="flex w-full items-center justify-between rounded-[1rem] px-3 py-3 text-left transition duration-200 hover:bg-background/70"
                        >
                          <div>
                            <p className="font-medium text-foreground">{suggestion.name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{suggestion.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {suggestion.featured ? (
                              <span className="rounded-full border border-accent/70 bg-accent/70 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                                Featured
                              </span>
                            ) : null}
                            <span className="rounded-full border border-border bg-white px-2.5 py-1 text-xs text-muted-foreground">
                              {suggestion.pricing}
                            </span>
                          </div>
                        </button>
                      ))}
                      <Link
                        href={query ? `/tools?q=${encodeURIComponent(query)}` : "/tools"}
                        className="flex items-center gap-2 rounded-[1rem] px-3 py-3 text-sm font-medium text-primary transition duration-200 hover:bg-background/70"
                      >
                        <Sparkles className="h-4 w-4" />
                        Search the full directory for &quot;{query.trim()}&quot;
                      </Link>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Category</label>
            <select
              value={activeCategory}
              onChange={(event) =>
                updateFilters({
                  category: event.target.value || undefined,
                  page: undefined
                })
              }
              className="field-select"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_180px]">
          <div>
            <label className="mb-2 block text-sm font-semibold">Tags</label>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onBlur={(event) => commitTags(parseTags(event.target.value))}
                placeholder="agents, automation, video"
                className="pl-11"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Sort</label>
            <select
              value={activeSort}
              onChange={(event) =>
                updateFilters({
                  sort: event.target.value,
                  page: undefined
                })
              }
              className="field-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-2 block text-sm font-semibold">Pricing</label>
          <motion.div layout className="flex flex-wrap gap-2">
            {pricingOptions.map((pricing) => {
              const active = activePricing === pricing;

              return (
                <button
                  key={pricing}
                  type="button"
                  onClick={() =>
                    updateFilters({
                      pricing: active ? undefined : pricing,
                      page: undefined
                    })
                  }
                  className={`${chipClasses} ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-white/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pricing}
                </button>
              );
            })}
          </motion.div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Quick filters</label>
          <motion.div layout className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                updateFilters({
                  featured: activeFeatured ? undefined : "true",
                  page: undefined
                })
              }
              className={`${chipClasses} ${
                activeFeatured
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-white/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              Featured only
            </button>
            <button
              type="button"
              onClick={() =>
                updateFilters({
                  recent: activeRecent ? undefined : "true",
                  page: undefined
                })
              }
              className={`${chipClasses} ${
                activeRecent
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-white/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              Added in last 30 days
            </button>
          </motion.div>
        </div>
      </div>

      {topTags.length ? (
        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold">Popular tags</label>
          <motion.div layout className="flex flex-wrap gap-2">
            {topTags.map((tag) => {
              const active = activeTags.includes(tag.tag);

              return (
                <button
                  key={tag.tag}
                  type="button"
                  onClick={() => toggleTopTag(tag.tag)}
                  className={`${chipClasses} ${
                    active
                      ? "bg-secondary text-secondary-foreground shadow-sm"
                      : "border border-border bg-white/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag.tag} <span className="text-xs opacity-70">({tag.count})</span>
                </button>
              );
            })}
          </motion.div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4 md:flex-row md:items-center md:justify-between">
        <motion.div layout className="flex flex-wrap gap-2">
          {activeCategory ? (
            <button
              type="button"
              onClick={() => updateFilters({ category: undefined, page: undefined })}
              className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Category: {categories.find((category) => category.slug === activeCategory)?.name ?? activeCategory} x
            </button>
          ) : null}
          {activePricing ? (
            <button
              type="button"
              onClick={() => updateFilters({ pricing: undefined, page: undefined })}
              className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Pricing: {activePricing} x
            </button>
          ) : null}
          {activeFeatured ? (
            <button
              type="button"
              onClick={() => updateFilters({ featured: undefined, page: undefined })}
              className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Featured x
            </button>
          ) : null}
          {activeRecent ? (
            <button
              type="button"
              onClick={() => updateFilters({ recent: undefined, page: undefined })}
              className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Recent x
            </button>
          ) : null}
          {activeTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => commitTags(activeTags.filter((value) => value !== tag))}
              className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Tag: {tag} x
            </button>
          ))}
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                updateFilters({ q: undefined, page: undefined });
              }}
              className="rounded-full border border-border bg-white px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Search: {query} x
            </button>
          ) : null}
        </motion.div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTagInput("");
              updateFilters({
                q: undefined,
                category: undefined,
                pricing: undefined,
                tags: undefined,
                tag: undefined,
                featured: undefined,
                recent: undefined,
                sort: "newest",
                page: undefined
              });
            }}
            className="font-medium text-primary transition hover:text-primary/80"
          >
            Reset filters
          </button>
          <p className="text-muted-foreground">
            {isPending ? "Updating results..." : "Filters update the URL without a full page reload."}
          </p>
        </div>
      </div>
    </div>
  );
}
