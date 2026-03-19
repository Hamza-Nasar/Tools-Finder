import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { handleApiError, noContent, ok, parseRequestBody } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { CategoryService } from "@/lib/services/category-service";
import { categoryUpdateSchema } from "@/lib/validators/category";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await CategoryService.getCategoryBySlug(slug);

    return ok(category);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdminSession();
    const { slug } = await params;
    const payload = await parseRequestBody(request, categoryUpdateSchema);
    const category = await CategoryService.updateCategoryBySlug(slug, payload);

    revalidateTag("categories");
    revalidateTag("tools");
    revalidatePath("/categories");
    revalidatePath(`/categories/${slug}`);
    revalidatePath(`/categories/${category.slug}`);
    revalidatePath("/admin/categories");

    return ok(category);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await requireAdminSession();
    const { slug } = await params;
    await CategoryService.deleteCategoryBySlug(slug);

    revalidateTag("categories");
    revalidateTag("tools");
    revalidatePath("/categories");
    revalidatePath(`/categories/${slug}`);
    revalidatePath("/admin/categories");

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
