import { NextRequest } from "next/server";
import { created, handleApiError, ok, parseRequestBody } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { AdminInviteService } from "@/lib/services/admin-invite-service";
import { adminInviteCreateSchema } from "@/lib/validators/user";

export async function GET() {
  try {
    await requireAdminSession();
    const invites = await AdminInviteService.listPendingInvites();

    return ok({
      invites
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const payload = await parseRequestBody(request, adminInviteCreateSchema);
    const result = await AdminInviteService.createInvite({
      ...payload,
      invitedByUserId: session.user.id,
      invitedByEmail: session.user.email ?? "admin",
      baseUrl: request.nextUrl.origin
    });

    return created(result);
  } catch (error) {
    return handleApiError(error);
  }
}
