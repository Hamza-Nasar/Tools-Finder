"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Tool, UserStack } from "@/types";
import { addToolToStackAction, removeToolFromStackAction, saveStackDetailsAction } from "@/lib/actions/stack-actions";
import { initialActionState } from "@/lib/actions/action-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { ToolCard } from "@/components/tools/tool-card";

export function StackBuilder({
  stack,
  suggestedTools
}: {
  stack: UserStack;
  suggestedTools: Tool[];
}) {
  const router = useRouter();
  const [state, formAction, isSaving] = useActionState(saveStackDetailsAction, initialActionState);
  const [isPending, startTransition] = useTransition();

  function handleAdd(toolId: string) {
    startTransition(async () => {
      await addToolToStackAction(toolId);
      router.refresh();
    });
  }

  function handleRemove(toolId: string) {
    startTransition(async () => {
      await removeToolFromStackAction(toolId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="border-b border-border/70">
          <CardTitle>Stack details</CardTitle>
          <CardDescription>Name your stack and describe what this tool set is for.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={formAction} className="grid gap-4">
            <Input name="name" defaultValue={stack.name} placeholder="My AI Stack" />
            <Textarea
              name="description"
              defaultValue={stack.description ?? ""}
              placeholder="A short description of how you use this stack."
              className="min-h-[120px]"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save stack"}
              </Button>
              {state.message ? (
                <p className={`text-sm ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
                  {state.message}
                </p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Current stack</p>
          <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">Your selected tools</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add or remove tools to shape a stack around your real workflow.
          </p>
        </div>

        {stack.tools.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {stack.tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                action={
                  <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={() => handleRemove(tool.id)}>
                    Remove
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            label="Stack"
            title="Your stack is empty"
            description="Start adding tools below to build a personal AI stack you can revisit anytime."
            ctaHref="/tools"
            ctaLabel="Browse tools"
          />
        )}
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Suggested additions</p>
          <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">Popular tools to add next</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Suggestions are pulled from the strongest tools not already in your stack.
          </p>
        </div>

        {suggestedTools.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {suggestedTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                action={
                  <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => handleAdd(tool.id)}>
                    Add to stack
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            label="Stack"
            title="No more suggestions right now"
            description="Your stack already includes the currently surfaced suggestions."
            ctaHref="/tools"
            ctaLabel="Explore more tools"
          />
        )}
      </section>
    </div>
  );
}
