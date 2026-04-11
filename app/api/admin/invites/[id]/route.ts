import { noContent, handleApiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/server-guards";
import { AdminInviteService } from "@/lib/services/admin-invite-service";

export async function DELETE(
  _: Request,
  {
    params
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    await AdminInviteService.revokeInvite({
      inviteId: id
    });

    return noContent();
  } catch (error) {
    return handleApiError(error);
  }
}
