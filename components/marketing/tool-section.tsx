import Link from "next/link";
import type { Tool } from "@/types";
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
    <section className="page-frame py-10 md:py-14">
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
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
