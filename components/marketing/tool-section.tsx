import Link from "next/link";
import type { Tool } from "@/types";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { ToolCard } from "@/components/tools/tool-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

interface ToolSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  tools: Tool[];
}

export function ToolSection({ eyebrow, title, description, tools }: ToolSectionProps) {
  if (!tools.length) {
    return null;
  }

  return (
    <section className="page-frame py-12 md:py-16">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={
          <Button asChild variant="outline">
            <Link href="/tools">View all tools</Link>
          </Button>
        }
      />
      <MotionReveal className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" y={14}>
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </MotionReveal>
    </section>
  );
}
