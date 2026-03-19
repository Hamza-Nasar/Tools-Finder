import { NextRequest } from "next/server";
import { handleApiError, paginated, parseSearchParams } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { UserService } from "@/lib/services/user-service";
import { userListQuerySchema } from "@/lib/validators/user";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const query = parseSearchParams(request.nextUrl.searchParams, userListQuerySchema);
    const result = await UserService.listUsers({
      page: query.page ?? 1,
      limit: query.limit ?? 12,
      role: query.role,
      q: query.q
    });

    return paginated(result);
  } catch (error) {
    return handleApiError(error);
  }
}
