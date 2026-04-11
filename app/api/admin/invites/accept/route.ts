import { getServerSession } from "next-auth";
import { handleApiError, ok, parseRequestBody } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { AdminInviteService } from "@/lib/services/admin-invite-service";
import { adminInviteAcceptSchema } from "@/lib/validators/user";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const payload = await parseRequestBody(request, adminInviteAcceptSchema);
    const result = await AdminInviteService.acceptInvite({
      ...payload,
      sessionUser: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name
          }
        : null
    });

    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}
