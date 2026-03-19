"use client";

import { useActionState, useEffect, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/lib/actions/action-types";
import { categoryFormAction, deleteCategoryFormAction } from "@/lib/actions/category-actions";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialCategoryState: ActionState<Category> = { status: "idle" };

function DeleteCategoryButton({
  slug
}: {
  slug: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm("Delete this category?");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategoryFormAction(slug);

      if (result.status === "success") {
        router.refresh();
      } else {
        window.alert(result.message ?? "Unable to delete category.");
      }
    });
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleDelete} disabled={isPending}>
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}

function CategoryFormCard({
  category
}: {
  category: Category | null;
}) {
  const router = useRouter();
  const action = category ? categoryFormAction.bind(null, category.slug) : categoryFormAction.bind(null, null);
  const [state, formAction, isPending] = useActionState(action, initialCategoryState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-border/70 bg-gradient-to-br from-white via-white to-background/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{category ? category.name : "Create category"}</CardTitle>
            <CardDescription>
              {category
                ? "Update taxonomy copy, URL structure, and positioning text."
                : "Add a new category to power homepage, filters, and landing pages."}
            </CardDescription>
          </div>
          {category ? <Badge variant="muted">{category.toolCount} tools</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={formAction}>
          <div className="space-y-2">
            <Label htmlFor={`name-${category?.id ?? "new"}`}>Name</Label>
            <Input id={`name-${category?.id ?? "new"}`} name="name" defaultValue={category?.name ?? ""} />
            {state.fieldErrors?.name?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`slug-${category?.id ?? "new"}`}>Slug</Label>
            <Input id={`slug-${category?.id ?? "new"}`} name="slug" defaultValue={category?.slug ?? ""} />
            {state.fieldErrors?.slug?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`description-${category?.id ?? "new"}`}>Description</Label>
            <Textarea
              id={`description-${category?.id ?? "new"}`}
              name="description"
              defaultValue={category?.description ?? ""}
            />
            {state.fieldErrors?.description?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.description[0]}</p>
            ) : null}
          </div>
          {state.message ? (
            <p className={cn("text-sm", state.status === "success" ? "text-primary" : "text-destructive")}>
              {state.message}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : category ? "Save category" : "Create category"}
            </Button>
            {category ? <DeleteCategoryButton slug={category.slug} /> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function CategoryManagementConsole({
  categories
}: {
  categories: Category[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryFormCard category={null} />
        <Card className="border-dashed bg-white/72">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Taxonomy guidelines</CardTitle>
            <CardDescription>Keep categories broad enough to scale, but specific enough to be useful in search.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use 1-3 words per category name and a clear slug.</p>
            <p>Descriptions should read like landing-page copy, not internal notes.</p>
            <p>Delete only empty categories to avoid broken tool relationships.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {categories.map((category) => (
          <CategoryFormCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
