import { getServerSession } from "next-auth";
import { AdminInviteExperience } from "@/components/auth/admin-invite-experience";
import { authOptions } from "@/lib/auth";
import { env } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";
import { AdminInviteService } from "@/lib/services/admin-invite-service";

export const metadata = buildMetadata({
  title: "Admin Invite | AI Tools Finder",
  description: "Accept an AI Tools Finder admin invite.",
  path: "/auth/admin-invite",
  noIndex: true
});

export const dynamic = "force-dynamic";

export default async function AdminInvitePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const tokenParam = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = tokenParam?.trim() ?? "";
  const [session, invite] = await Promise.all([
    getServerSession(authOptions),
    token
      ? AdminInviteService.getInvitePreview(token).catch(() => null)
      : Promise.resolve(null)
  ]);

  return (
    <AdminInviteExperience
      token={token}
      invite={invite}
      currentUserEmail={session?.user?.email ?? null}
      googleEnabled={Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)}
    />
  );
}
