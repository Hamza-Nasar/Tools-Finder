import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { created, handleApiError, paginated, parseRequestBody, parseSearchParams } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { CategoryService } from "@/lib/services/category-service";
import { categoryCreateSchema, categoryListQuerySchema } from "@/lib/validators/category";

export async function GET(request: NextRequest) {
  try {
    const query = parseSearchParams(request.nextUrl.searchParams, categoryListQuerySchema);
    const result = await CategoryService.listCategories(query);

    return paginated(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const payload = await parseRequestBody(request, categoryCreateSchema);
    const category = await CategoryService.createCategory({
      name: payload.name,
      slug: payload.slug ?? payload.name,
      description: payload.description
    });

    revalidateTag("categories");
    revalidateTag("tools");
    revalidatePath("/categories");
    revalidatePath("/admin/categories");

    return created(category);
  } catch (error) {
    return handleApiError(error);
  }
}
