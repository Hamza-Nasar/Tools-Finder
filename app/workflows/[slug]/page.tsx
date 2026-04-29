import { notFound } from "next/navigation";
import { ToolService } from "@/lib/services/tool-service";
import { buildMetadata } from "@/lib/seo";
import { getWorkflowBySlug } from "@/lib/workflows";
import { PageHero } from "@/components/shared/page-hero";
import { WorkflowDetail } from "@/components/workflows/workflow-detail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const workflow = getWorkflowBySlug((await params).slug);

  if (!workflow) {
    return buildMetadata({
      title: "Workflow not found",
      description: "The requested workflow could not be found."
    });
  }

  return buildMetadata({
    title: workflow.title,
    description: workflow.description,
    path: `/workflows/${workflow.slug}`,
    keywords: [workflow.title, workflow.audience, ...workflow.toolsUsed]
  });
}

export default async function WorkflowDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const workflow = getWorkflowBySlug((await params).slug);

  if (!workflow) {
    notFound();
  }

  const tools = await ToolService.listToolsBySlugs(workflow.toolsUsed);

  return (
    <div className="page-frame py-14">
      <PageHero
        eyebrow="Workflow"
        title={workflow.title}
        description={workflow.description}
        stats={[
          { label: "Audience", value: workflow.audience, detail: "who this workflow is designed for" },
          { label: "Steps", value: String(workflow.steps.length), detail: "visualized as a repeatable process" }
        ]}
      />

      <div className="mt-10">
        <WorkflowDetail workflow={workflow} tools={tools} />
      </div>
    </div>
  );
}
