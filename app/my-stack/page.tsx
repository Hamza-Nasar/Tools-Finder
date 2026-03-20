import { buildMetadata } from "@/lib/seo";
import { requireAuthenticatedSession } from "@/lib/server-guards";
import { StackService } from "@/lib/services/stack-service";
import { ToolService } from "@/lib/services/tool-service";
import { UserService } from "@/lib/services/user-service";
import { PageHero } from "@/components/shared/page-hero";
import { StackBuilder } from "@/components/tools/stack-builder";

export const metadata = buildMetadata({
  title: "My AI Stack",
  description: "Create and manage a personal AI stack for your workflow.",
  path: "/my-stack",
  noIndex: true
});

export const dynamic = "force-dynamic";

export default async function MyStackPage() {
  const session = await requireAuthenticatedSession();
  const user = await UserService.syncSessionUser(session);
  const stack = await StackService.getStackForUser(user.id);
  const suggested = await ToolService.listTools({
    page: 1,
    limit: 12,
    sort: "popular"
  });
  const suggestedTools = suggested.data.filter((tool) => !stack.tools.some((stackTool) => stackTool.id === tool.id)).slice(0, 6);

  return (
    <div className="page-frame py-12">
      <PageHero
        eyebrow="My stack"
        title={stack.name}
        description={stack.description ?? "Build a focused AI stack around the way you actually work."}
        stats={[
          { label: "Tools in stack", value: String(stack.tools.length), detail: "saved to your account" },
          { label: "Updated", value: new Date(stack.updatedAt).toLocaleDateString(), detail: "latest saved version" }
        ]}
      />

      <div className="mt-10">
        <StackBuilder stack={stack} suggestedTools={suggestedTools} />
      </div>
    </div>
  );
}
