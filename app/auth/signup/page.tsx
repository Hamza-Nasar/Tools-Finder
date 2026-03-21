import { AuthExperience } from "@/components/auth/auth-experience";
import { env } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Signup | AI Tools Finder",
  description: "Create an AI Tools Finder account with email and password or continue with Google.",
  path: "/auth/signup",
  noIndex: true
});

function resolveCallbackUrl(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && candidate.startsWith("/") ? candidate : "/dashboard";
}

export default async function SignupPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <AuthExperience
      mode="signup"
      callbackUrl={resolveCallbackUrl(params.callbackUrl)}
      googleEnabled={Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)}
    />
  );
}
