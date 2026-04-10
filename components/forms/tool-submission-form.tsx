"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Category } from "@/types";
import { initialActionState } from "@/lib/actions/action-types";
import { submitToolAction } from "@/lib/actions/submission-actions";
import { pricingOptions } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Submitting..." : "Submit for review"}
    </Button>
  );
}

export function ToolSubmissionForm({
  categories,
  aiAssistantEnabled
}: {
  categories: Category[];
  aiAssistantEnabled?: boolean;
}) {
  const [state, formAction] = useActionState(submitToolAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [assistantState, setAssistantState] = useState<{
    status: "idle" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setAssistantState({ status: "idle" });
    }
  }, [state.status]);

  function setFieldValue(name: string, value: string) {
    const element = formRef.current?.elements.namedItem(name);

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      element.value = value;
    }
  }

  async function handleGenerateDraft() {
    if (!aiAssistantEnabled) {
      setAssistantState({
        status: "error",
        message: "Add OPENAI_API_KEY in your environment to enable AI listing drafts."
      });
      return;
    }

    if (!formRef.current) {
      return;
    }

    setIsGenerating(true);
    setAssistantState({ status: "idle" });

    try {
      const formData = new FormData(formRef.current);
      const draftInput = {
        name: String(formData.get("name") ?? "").trim(),
        website: String(formData.get("website") ?? "").trim(),
        tagline: String(formData.get("tagline") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim()
      };

      if (!draftInput.name && !draftInput.website && !draftInput.tagline && !draftInput.description) {
        throw new Error("Enter at least a tool name, website, tagline, or description before using AI draft.");
      }

      const response = await fetch("/api/ai/submission-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(draftInput)
      });
      const payload = (await response.json()) as {
        data?: {
          tagline: string;
          description: string;
          categorySlug: string;
          tags: string[];
          pricing: "Free" | "Freemium" | "Paid";
        };
        error?: string;
        details?: {
          formErrors?: string[];
        };
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.details?.formErrors?.[0] ?? payload.error ?? "Unable to generate the listing draft.");
      }

      setFieldValue("tagline", payload.data.tagline);
      setFieldValue("description", payload.data.description);
      setFieldValue("category", payload.data.categorySlug);
      setFieldValue("tags", payload.data.tags.join(", "));
      setFieldValue("pricing", payload.data.pricing);
      setAssistantState({
        status: "success",
        message: "AI draft applied. Review the copy, tags, category, and pricing before you submit."
      });
    } catch (error) {
      setAssistantState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to generate the listing draft."
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card className="shadow-glow">
      <CardHeader className="hero-mesh border-b border-border/70">
        <CardTitle>Submit a new AI tool</CardTitle>
        <CardDescription>
          Submissions enter a pending moderation queue and are reviewed before appearing in the public directory.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form ref={formRef} className="space-y-6" action={formAction}>
          <div className="surface-subtle flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">AI submission assistant</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate sharper listing copy, tags, category, and pricing from the details you already entered.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateDraft}
              disabled={!aiAssistantEnabled || isGenerating}
            >
              {isGenerating ? "Generating..." : aiAssistantEnabled ? "Generate with AI" : "AI unavailable"}
            </Button>
          </div>

          {assistantState.message ? (
            <p className={`text-sm ${assistantState.status === "error" ? "text-destructive" : "text-primary"}`}>
              {assistantState.message}
            </p>
          ) : null}

          <div className="surface-subtle p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Core listing</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Start with the essentials that shape the public listing and search result preview.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tool name</Label>
                <Input id="name" name="name" placeholder="e.g. Scene Shift" />
                {state.fieldErrors?.name?.[0] ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" name="website" placeholder="https://example.com" />
                {state.fieldErrors?.website?.[0] ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.website[0]}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="affiliateUrl">Affiliate URL</Label>
                <Input id="affiliateUrl" name="affiliateUrl" placeholder="https://example.com/?ref=partner" />
                {state.fieldErrors?.affiliateUrl?.[0] ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.affiliateUrl[0]}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact email</Label>
                <Input id="contactEmail" name="contactEmail" type="email" placeholder="founder@example.com" />
                {state.fieldErrors?.contactEmail?.[0] ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.contactEmail[0]}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" placeholder="Describe the core value in one strong sentence." />
              {state.fieldErrors?.tagline?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.tagline[0]}</p>
              ) : null}
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the target user, what the tool does, and the workflow it improves."
              />
              {state.fieldErrors?.description?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.description[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="surface-subtle p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Catalog placement</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose the taxonomy and positioning metadata that help users discover the product quickly.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  className="field-select"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {state.fieldErrors?.category?.[0] ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.category[0]}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing">Pricing</Label>
                <select
                  id="pricing"
                  name="pricing"
                  defaultValue="Freemium"
                  className="field-select"
                >
                  {pricingOptions.map((pricing) => (
                    <option key={pricing} value={pricing}>
                      {pricing}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" name="tags" placeholder="automation, video, editing" />
                {state.fieldErrors?.tags?.[0] ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.tags[0]}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="surface-subtle p-5">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Media</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Clean logos and screenshots make the listing feel premium once it passes moderation.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input id="logo" name="logo" placeholder="https://..." />
                {state.fieldErrors?.logo?.[0] ? (
                  <p className="text-sm text-destructive">{state.fieldErrors.logo[0]}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="screenshots">Screenshot URLs</Label>
                <Input id="screenshots" name="screenshots" placeholder="https://... , https://..." />
              </div>
            </div>
          </div>

          <div className="hidden">
            <Label htmlFor="websiteConfirm">Leave this field empty</Label>
            <Input
              id="websiteConfirm"
              name="websiteConfirm"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
          </div>

          {state.message ? (
            <p className={`text-sm ${state.status === "success" ? "text-primary" : "text-destructive"}`}>
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-border/70 pt-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Approved tools can later be featured on homepage and category spotlight surfaces.
            </p>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
