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
    <div className="page-frame py-12">
      <PageHero
        eyebrow="Workflows"
        title="Repeatable AI workflows for real work."
        description="Structured, tool-backed workflows that show how AI products can fit together into production-ready systems."
        stats={[
          { label: "Workflows", value: String(workflows.length), detail: "covering creator, marketing, and engineering use cases" }
        ]}
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <WorkflowCard key={workflow.slug} workflow={workflow} />
        ))}
      </div>
    </div>
  );
}
