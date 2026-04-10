"use client";

import { useActionState, useEffect, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/lib/actions/action-types";
import { deleteSubmissionFormAction, submissionReviewFormAction } from "@/lib/actions/moderation-actions";
import { pricingOptions } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { Category, Submission } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialSubmissionState: ActionState<Submission> = { status: "idle" };

function DeleteSubmissionButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm("Delete this submission?");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteSubmissionFormAction(id);

      if (result.status === "success") {
        router.refresh();
      } else {
        window.alert(result.message ?? "Unable to delete submission.");
      }
    });
  }

  return (
    <Button type="button" variant="outline" onClick={handleDelete} disabled={isPending}>
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}

function SubmissionReviewCard({
  submission,
  categories
}: {
  submission: Submission;
  categories: Category[];
}) {
  const router = useRouter();
  const action = submissionReviewFormAction.bind(null, submission.id);
  const [state, formAction, isPending] = useActionState(action, initialSubmissionState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <Card className={cn("overflow-hidden", submission.status === "pending" ? "shadow-glow" : "")}>
      <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-secondary/50">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{submission.name}</CardTitle>
              <Badge variant={submission.status === "approved" ? "accent" : "muted"}>
                {submission.status}
              </Badge>
            </div>
            <CardDescription className="mt-2">{submission.tagline}</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Submitted {formatDate(submission.createdAt)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-5" action={formAction}>
          {submission.aiReview ? (
            <div className="surface-subtle space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">AI review</Badge>
                {submission.aiReview.recommendedAction ? (
                  <Badge variant={submission.aiReview.recommendedAction === "approve" ? "accent" : "muted"}>
                    {submission.aiReview.recommendedAction}
                  </Badge>
                ) : null}
                {submission.aiReview.qualityScore !== null ? (
                  <Badge variant="muted">Quality {submission.aiReview.qualityScore}/100</Badge>
                ) : null}
                {submission.aiReview.confidence !== null ? (
                  <Badge variant="muted">Confidence {Math.round(submission.aiReview.confidence * 100)}%</Badge>
                ) : null}
              </div>

              <p className="text-sm leading-7 text-muted-foreground">{submission.aiReview.summary}</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.1rem] border border-border/70 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary">Suggested category</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {submission.aiReview.suggestedCategorySlug ?? "No suggestion"}
                  </p>
                </div>
                <div className="rounded-[1.1rem] border border-border/70 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary">AI classification</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {submission.aiReview.isLikelyAiTool === null
                      ? "Unknown"
                      : submission.aiReview.isLikelyAiTool
                        ? "Likely an AI tool"
                        : "Needs manual validation"}
                  </p>
                </div>
              </div>

              {submission.aiReview.suggestedTags.length ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary">Suggested tags</p>
                  <div className="flex flex-wrap gap-2">
                    {submission.aiReview.suggestedTags.map((tag) => (
                      <Badge key={tag} variant="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {submission.aiReview.riskFlags.length ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.16em] text-primary">Risk flags</p>
                  <div className="flex flex-wrap gap-2">
                    {submission.aiReview.riskFlags.map((flag) => (
                      <Badge key={flag} variant="muted">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`submission-name-${submission.id}`}>Tool name</Label>
              <Input id={`submission-name-${submission.id}`} name="name" defaultValue={submission.name} />
              {state.fieldErrors?.name?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`submission-website-${submission.id}`}>Website</Label>
              <Input id={`submission-website-${submission.id}`} name="website" defaultValue={submission.website} />
              {state.fieldErrors?.website?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.website[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`submission-affiliate-${submission.id}`}>Affiliate URL</Label>
              <Input
                id={`submission-affiliate-${submission.id}`}
                name="affiliateUrl"
                defaultValue={submission.affiliateUrl ?? ""}
                placeholder="https://example.com/?ref=partner"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`submission-contact-${submission.id}`}>Contact email</Label>
              <Input
                id={`submission-contact-${submission.id}`}
                name="contactEmail"
                type="email"
                defaultValue={submission.contactEmail ?? ""}
                placeholder="founder@example.com"
              />
            </div>
          </div>

          <div className="surface-subtle space-y-2 p-5">
            <Label htmlFor={`submission-tagline-${submission.id}`}>Tagline</Label>
            <Input id={`submission-tagline-${submission.id}`} name="tagline" defaultValue={submission.tagline} />
            <Label htmlFor={`submission-description-${submission.id}`}>Description</Label>
            <Textarea
              id={`submission-description-${submission.id}`}
              name="description"
              defaultValue={submission.description}
            />
            {state.fieldErrors?.description?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.description[0]}</p>
            ) : null}
          </div>

          <div className="surface-subtle grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor={`submission-category-${submission.id}`}>Category</Label>
              <select
                id={`submission-category-${submission.id}`}
                name="categorySlug"
                defaultValue={submission.categorySlug}
                className="field-select"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`submission-pricing-${submission.id}`}>Pricing</Label>
              <select
                id={`submission-pricing-${submission.id}`}
                name="pricing"
                defaultValue={submission.pricing}
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
              <Label htmlFor={`submission-tags-${submission.id}`}>Tags</Label>
              <Input id={`submission-tags-${submission.id}`} name="tags" defaultValue={submission.tags.join(", ")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`submission-logo-${submission.id}`}>Logo URL</Label>
              <Input id={`submission-logo-${submission.id}`} name="logo" defaultValue={submission.logo ?? ""} />
            </div>
          </div>

          <div className="surface-subtle space-y-2 p-5">
            <Label htmlFor={`submission-screenshots-${submission.id}`}>Screenshot URLs</Label>
            <Input
              id={`submission-screenshots-${submission.id}`}
              name="screenshots"
              defaultValue={submission.screenshots.join(", ")}
            />
            <Label htmlFor={`submission-note-${submission.id}`}>Moderation note</Label>
            <Textarea
              id={`submission-note-${submission.id}`}
              name="moderationNote"
              defaultValue={submission.moderationNote ?? ""}
              placeholder="Optional note for the submitter or internal moderation context."
            />
          </div>

          {state.message ? (
            <p className={cn("text-sm", state.status === "success" ? "text-primary" : "text-destructive")}>
              {state.message}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-border pt-4">
            <Button type="submit" name="intent" value="save" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button type="submit" name="intent" value="approve" variant="secondary" disabled={isPending}>
              Approve submission
            </Button>
            <Button type="submit" name="intent" value="reject" variant="outline" disabled={isPending}>
              Reject submission
            </Button>
            <DeleteSubmissionButton id={submission.id} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function SubmissionManagementConsole({
  submissions,
  categories
}: {
  submissions: Submission[];
  categories: Category[];
}) {
  const pendingCount = submissions.filter((submission) => submission.status === "pending").length;

  return (
    <div className="space-y-6">
      <Card className="border-dashed bg-white/72">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Moderation queue</CardTitle>
              <CardDescription>
                Review submissions, refine metadata, and approve directly into the live directory.
              </CardDescription>
            </div>
            <Badge variant="accent">{pendingCount} pending</Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {submissions.length ? (
          submissions.map((submission) => (
            <SubmissionReviewCard key={submission.id} submission={submission} categories={categories} />
          ))
        ) : (
          <Card className="border-dashed bg-white/72">
            <CardContent className="py-10 text-sm text-muted-foreground">
              No submissions are in the moderation queue right now.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
