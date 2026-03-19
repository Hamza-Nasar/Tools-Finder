import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { handleApiError, noContent, ok, parseRequestBody } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { ToolService } from "@/lib/services/tool-service";
import { updateToolSchema } from "@/lib/validators/tool";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const tool = await ToolService.getToolBySlug(slug);

    return ok(tool);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdminSession();
    const { slug } = await params;
    const payload = await parseRequestBody(request, updateToolSchema);
    const tool = await ToolService.updateToolBySlug(slug, payload);

    revalidateTag("tools");
    revalidateTag("categories");
    revalidatePath("/");
    revalidatePath("/tools");
    revalidatePath(`/tools/${slug}`);
    revalidatePath(`/tools/${tool.slug}`);
    revalidatePath(`/categories/${tool.categorySlug}`);
    revalidatePath("/admin/tools");

    return ok(tool);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdminSession();
    const { slug } = await params;
    const tool = await ToolService.getToolBySlug(slug, true);
    await ToolService.deleteToolBySlug(slug);

    revalidateTag("tools");
    revalidateTag("categories");
    revalidatePath("/");
    revalidatePath("/tools");
    revalidatePath(`/tools/${slug}`);
    revalidatePath(`/categories/${tool.categorySlug}`);
    revalidatePath("/admin/tools");

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
