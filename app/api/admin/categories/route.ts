import { NextRequest } from "next/server";
import { handleApiError, paginated, parseSearchParams } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { CategoryService } from "@/lib/services/category-service";
import { categoryListQuerySchema } from "@/lib/validators/category";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const query = parseSearchParams(request.nextUrl.searchParams, categoryListQuerySchema);
    const result = await CategoryService.listCategories(query);

    return paginated(result);
  } catch (error) {
    return handleApiError(error);
  }
}
