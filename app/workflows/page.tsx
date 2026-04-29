import { workflows } from "@/lib/workflows";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/shared/page-hero";
import { WorkflowCard } from "@/components/workflows/workflow-card";

export const metadata = buildMetadata({
  title: "AI Workflows",
  description: "Explore step-by-step AI workflows for creators, marketers, and developers.",
  path: "/workflows",
  keywords: ["ai workflows", "ai automations", "ai productivity workflows"]
});

export default function WorkflowsPage() {
  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Workflows"
        title="Repeatable AI workflows for real work."
        description="Structured workflows showing how tools fit together into production-ready systems."
        stats={[
          { label: "Workflows", value: String(workflows.length), detail: "covering creator, marketing, and engineering use cases" }
        ]}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Step-by-step</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Each workflow is structured as a practical sequence, not a generic list of tools.
          </p>
        </div>
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Outcome-first</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Focus is on shipping outcomes faster, not collecting disconnected app links.
          </p>
        </div>
        <div className="section-shell p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Team-ready</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Suitable for creators, marketers, and builders who need repeatable execution playbooks.
          </p>
        </div>
      </section>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <WorkflowCard key={workflow.slug} workflow={workflow} />
        ))}
      </div>
    </div>
  );
}
