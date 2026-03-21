import { AuthExperience } from "@/components/auth/auth-experience";
import { env } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Login | AI Tools Finder",
  description: "Log in to AI Tools Finder with email and password or continue with Google.",
  path: "/auth/login",
  noIndex: true
});

function resolveCallbackUrl(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && candidate.startsWith("/") ? candidate : "/dashboard";
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <AuthExperience
      mode="login"
      callbackUrl={resolveCallbackUrl(params.callbackUrl)}
      googleEnabled={Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)}
    />
  );
}
