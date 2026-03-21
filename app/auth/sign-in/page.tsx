import { redirect } from "next/navigation";

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const callbackUrl = Array.isArray(params.callbackUrl) ? params.callbackUrl[0] : params.callbackUrl;
  const normalizedCallback = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";

  redirect(`/auth/login?callbackUrl=${encodeURIComponent(normalizedCallback)}`);
}
