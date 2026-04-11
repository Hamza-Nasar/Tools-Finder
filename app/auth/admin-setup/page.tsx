import { FirstAdminSetupExperience } from "@/components/auth/first-admin-setup-experience";
import { env } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";
import { UserService } from "@/lib/services/user-service";

export const metadata = buildMetadata({
  title: "First Admin Setup | AI Tools Finder",
  description: "Create the first AI Tools Finder admin account.",
  path: "/auth/admin-setup",
  noIndex: true
});

export const dynamic = "force-dynamic";

export default async function FirstAdminSetupPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const tokenParam = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = tokenParam?.trim() ?? "";
  const recoveryEnabled = Boolean(env.ADMIN_SETUP_RECOVERY_ENABLED);
  const hasAdmin = await UserService.hasAdminAccount().catch(() => true);

  return (
    <FirstAdminSetupExperience
      token={token}
      setupConfigured={Boolean(env.ADMIN_SETUP_TOKEN)}
      setupOpen={!hasAdmin || recoveryEnabled}
      recoveryEnabled={recoveryEnabled && hasAdmin}
    />
  );
}
