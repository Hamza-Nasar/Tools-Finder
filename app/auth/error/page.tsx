import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const errorMessages: Record<string, string> = {
  OAuthCallback: "Google sign-in timed out while completing the OAuth callback. Check your internet connection and raise AUTH_HTTP_TIMEOUT_MS if needed.",
  OAuthAccountNotLinked: "This email already exists without a linked Google account. The auth flow should now link matching Google accounts automatically after a fresh retry."
};

export default async function AuthErrorPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const rawError = params.error;
  const error = Array.isArray(rawError) ? rawError[0] : rawError;
  const description =
    (error && errorMessages[error]) ||
    "The sign-in request could not be completed. Check environment variables, provider credentials, and network access to Google.";

  return (
    <div className="page-frame flex min-h-[70vh] max-w-2xl items-center py-12">
      <Card className="w-full shadow-glow">
        <CardHeader className="hero-mesh border-b border-border/70">
          <CardTitle>Authentication error</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-muted-foreground">Error code: {error}</p> : null}
          <Button asChild>
            <Link href="/auth/sign-in">Try again</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
