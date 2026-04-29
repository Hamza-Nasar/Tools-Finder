"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/lib/actions/action-types";
import { deleteToolFormAction, toggleFeaturedFormAction, toolFormAction } from "@/lib/actions/tool-actions";
import { pricingOptions, toolStatusOptions } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { Category, Tool } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialToolState: ActionState<Tool> = { status: "idle" };

function ToolDeleteButton({
  slug,
  onDeleted
}: {
  slug: string;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleDelete() {
    const confirmed = window.confirm("Delete this tool from the directory?");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteToolFormAction(slug);
      setMessage(result.message ?? null);

      if (result.status === "success") {
        onDeleted();
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={handleDelete} disabled={isPending}>
        <Trash2 className="mr-2 h-4 w-4" />
        {isPending ? "Deleting..." : "Delete tool"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}

function FeaturedToggleButton({
  tool,
  onUpdated
}: {
  tool: Tool;
  onUpdated: (slug: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleFeaturedFormAction(tool.slug, !tool.featured);

      if (result.status === "success") {
        onUpdated(result.data?.slug ?? tool.slug);
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={tool.featured ? "secondary" : "outline"}
      onClick={handleToggle}
      disabled={isPending}
      className="rounded-2xl"
    >
      <Star className={cn("mr-2 h-4 w-4", tool.featured ? "fill-current" : "")} />
      {tool.featured ? "Featured" : "Feature"}
    </Button>
  );
}

function ToolEditorForm({
  tool,
  categories,
  onSaved,
  onDeleted
}: {
  tool: Tool | null;
  categories: Category[];
  onSaved: (slug: string) => void;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const action = tool ? toolFormAction.bind(null, tool.slug) : toolFormAction.bind(null, null);
  const [state, formAction, isPending] = useActionState(action, initialToolState);

  useEffect(() => {
    if (state.status === "success" && state.data?.slug) {
      onSaved(state.data.slug);
      router.refresh();
    }
  }, [onSaved, router, state.data, state.status]);

  return (
    <Card className="shadow-glow">
      <CardHeader className="hero-mesh border-b border-border/70">
        <CardTitle>{tool ? "Edit tool" : "Create tool"}</CardTitle>
        <CardDescription>
          Manage directory quality, update metadata, and control featuring directly from this panel.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-6" action={formAction}>
          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tool name</Label>
              <Input id="name" name="name" defaultValue={tool?.name ?? ""} />
              {state.fieldErrors?.name?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={tool?.slug ?? ""} placeholder="auto-from-name" />
              {state.fieldErrors?.slug?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={tool?.website ?? ""} placeholder="https://example.com" />
              {state.fieldErrors?.website?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.website[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="affiliateUrl">Affiliate URL</Label>
              <Input
                id="affiliateUrl"
                name="affiliateUrl"
                defaultValue={tool?.affiliateUrl ?? ""}
                placeholder="https://example.com/?ref=partner"
              />
              {state.fieldErrors?.affiliateUrl?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.affiliateUrl[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" defaultValue={tool?.tagline ?? ""} />
              {state.fieldErrors?.tagline?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.tagline[0]}</p>
              ) : null}
            </div>
            {tool ? (
              <div className="rounded-[1.2rem] border border-border/70 bg-white/82 px-4 py-4 text-sm shadow-sm">
                <p className="font-semibold text-foreground">Commerce signals</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-muted-foreground">
                  <span>Clicks</span>
                  <span className="text-right font-medium text-foreground">{tool.clicksCount}</span>
                  <span>Feature source</span>
                  <span className="text-right font-medium capitalize text-foreground">
                    {tool.featureSource ?? "none"}
                  </span>
                  <span>Featured until</span>
                  <span className="text-right font-medium text-foreground">
                    {tool.featuredUntil ? formatDate(tool.featuredUntil) : "No expiry"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="surface-subtle space-y-2 p-5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={tool?.description ?? ""} />
            {state.fieldErrors?.description?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.description[0]}</p>
            ) : null}
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="categorySlug">Category</Label>
              <select
                id="categorySlug"
                name="categorySlug"
                defaultValue={tool?.categorySlug ?? categories[0]?.slug ?? ""}
                className="field-select"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.categorySlug?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.categorySlug[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricing">Pricing</Label>
              <select
                id="pricing"
                name="pricing"
                defaultValue={tool?.pricing ?? "Freemium"}
                className="field-select"
              >
                {pricingOptions.map((pricing) => (
                  <option key={pricing} value={pricing}>
                    {pricing}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.pricing?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.pricing[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={tool?.status ?? "approved"}
                className="field-select"
              >
                {toolStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.status?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.status[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={tool?.tags.join(", ") ?? ""}
                placeholder="video, editing, automation"
              />
              {state.fieldErrors?.tags?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.tags[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" name="logo" defaultValue={tool?.logo ?? ""} placeholder="https://..." />
              {state.fieldErrors?.logo?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.logo[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="screenshots">Screenshot URLs</Label>
              <Input
                id="screenshots"
                name="screenshots"
                defaultValue={tool?.screenshots.join(", ") ?? ""}
                placeholder="https://..., https://..."
              />
              {state.fieldErrors?.screenshots?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.screenshots[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="loginRequired">Login required</Label>
              <select
                id="loginRequired"
                name="loginRequired"
                defaultValue={tool?.loginRequired === true ? "yes" : tool?.loginRequired === false ? "no" : "unknown"}
                className="field-select"
              >
                <option value="unknown">Unknown</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill level</Label>
              <select
                id="skillLevel"
                name="skillLevel"
                defaultValue={tool?.skillLevel ?? ""}
                className="field-select"
              >
                <option value="">Unknown</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastCheckedAt">Last checked</Label>
              <Input
                id="lastCheckedAt"
                name="lastCheckedAt"
                type="datetime-local"
                defaultValue={tool?.lastCheckedAt ? new Date(tool.lastCheckedAt).toISOString().slice(0, 16) : ""}
              />
            </div>
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="platforms">Platforms</Label>
              <Input
                id="platforms"
                name="platforms"
                defaultValue={tool?.platforms?.join(", ") ?? ""}
                placeholder="Web, iOS, Android"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputTypes">Output types</Label>
              <Input
                id="outputTypes"
                name="outputTypes"
                defaultValue={tool?.outputTypes?.join(", ") ?? ""}
                placeholder="Text, PDF, Image"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bestFor">Best for</Label>
              <Input
                id="bestFor"
                name="bestFor"
                defaultValue={tool?.bestFor?.join(", ") ?? ""}
                placeholder="SEO audit, PDF compression"
              />
            </div>
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-white/82 px-4 py-3 text-sm font-medium shadow-sm">
              <input
                type="checkbox"
                name="verifiedListing"
                defaultChecked={tool?.verifiedListing ?? false}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Verified listing
            </label>
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input id="rating" name="rating" type="number" step="0.1" defaultValue={tool?.rating ?? 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewCount">Review count</Label>
              <Input id="reviewCount" name="reviewCount" type="number" defaultValue={tool?.reviewCount ?? 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trendingScore">Trending score</Label>
              <Input id="trendingScore" name="trendingScore" type="number" defaultValue={tool?.trendingScore ?? 0} />
            </div>
            <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-white/82 px-4 py-3 text-sm font-medium shadow-sm">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={tool?.featured ?? false}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              Feature on homepage
            </label>
          </div>

          {state.message ? (
            <p className={cn("text-sm", state.status === "success" ? "text-primary" : "text-destructive")}>
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : tool ? "Save tool" : "Create tool"}
              </Button>
              {tool ? <ToolDeleteButton slug={tool.slug} onDeleted={onDeleted} /> : null}
            </div>
            {tool ? (
              <p className="text-sm text-muted-foreground">Last updated {formatDate(tool.updatedAt ?? tool.createdAt)}</p>
            ) : (
              <p className="text-sm text-muted-foreground">New tools are created as approved by default.</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ToolManagementConsole({
  tools,
  categories
}: {
  tools: Tool[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(tools[0]?.slug ?? null);

  useEffect(() => {
    if (selectedSlug && tools.some((tool) => tool.slug === selectedSlug)) {
      return;
    }

    setSelectedSlug(tools[0]?.slug ?? null);
  }, [selectedSlug, tools]);

  const filteredTools = tools.filter((tool) => {
    const haystack = `${tool.name} ${tool.category} ${tool.tags.join(" ")} ${tool.status}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const selectedTool = tools.find((tool) => tool.slug === selectedSlug) ?? null;

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <Card className="overflow-hidden xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)]">
        <CardHeader className="hero-mesh border-b border-border/70">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Catalog</CardTitle>
              <CardDescription>
                {tools.length} tools indexed. Search, feature, or switch to create mode.
              </CardDescription>
            </div>
            <Button type="button" size="sm" onClick={() => setSelectedSlug(null)}>
              New tool
            </Button>
          </div>
          <div className="pt-3">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 overflow-y-auto pt-4">
          {filteredTools.length ? (
            filteredTools.map((tool) => {
              const isActive = tool.slug === selectedSlug;

              return (
                <div
                  key={tool.id}
                  className={cn(
                    "rounded-[1.35rem] border px-4 py-4 transition duration-300",
                    isActive
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-border/70 bg-background/55 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/82"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => setSelectedSlug(tool.slug)} className="min-w-0 flex-1 text-left">
                      <p className="font-semibold">{tool.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{tool.tagline}</p>
                    </button>
                    <FeaturedToggleButton tool={tool} onUpdated={setSelectedSlug} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="muted">{tool.category}</Badge>
                    <Badge variant={tool.featured ? "accent" : "default"}>{tool.status}</Badge>
                    {tool.clicksCount ? <Badge variant="muted">{tool.clicksCount} clicks</Badge> : null}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-[1.25rem] border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              No tools match this search yet.
            </p>
          )}
        </CardContent>
      </Card>

      <ToolEditorForm
        key={selectedTool?.slug ?? "new-tool"}
        tool={selectedTool}
        categories={categories}
        onSaved={setSelectedSlug}
        onDeleted={() => setSelectedSlug(null)}
      />
    </div>
  );
}
