import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Workflow } from "@/types";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkflowCard({ workflow }: { workflow: Workflow }) {
  return (
    <MotionReveal className="h-full" y={16}>
      <Link href={`/workflows/${workflow.slug}`} className="block h-full">
        <Card className="group surface-card-hover h-full overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-gradient-to-br from-white via-white to-background/70">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{workflow.audience}</p>
            <CardTitle className="mt-3 transition-colors duration-200 group-hover:text-primary">
              {workflow.title}
            </CardTitle>
            <CardDescription className="mt-2 leading-6">{workflow.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3 pt-6">
            <span className="text-sm font-medium text-primary">{workflow.steps.length} steps</span>
            <span className="inline-flex items-center text-sm text-muted-foreground transition group-hover:text-foreground">
              Open workflow
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </CardContent>
        </Card>
      </Link>
    </MotionReveal>
  );
}
