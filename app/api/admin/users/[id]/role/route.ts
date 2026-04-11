import { NextRequest } from "next/server";
import { handleApiError, ok, parseRequestBody } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { UserService } from "@/lib/services/user-service";
import { adminUpdateUserRoleSchema } from "@/lib/validators/user";

export async function PATCH(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const payload = await parseRequestBody(request, adminUpdateUserRoleSchema);
    const user = await UserService.updateUserRole({
      targetUserId: id,
      role: payload.role,
      actorUserId: session.user.id
    });

    return ok({
      user
    });
  } catch (error) {
    return handleApiError(error);
  }
}
