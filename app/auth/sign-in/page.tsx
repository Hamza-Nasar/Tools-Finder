"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.4-.2-2.1H12Z" />
      <path fill="#34A853" d="M12 21c2.7 0 5-.9 6.7-2.5l-3.1-2.4c-.9.6-2 1-3.6 1-2.7 0-5-1.8-5.8-4.3l-3.2 2.5C4.7 18.7 8.1 21 12 21Z" />
      <path fill="#4A90E2" d="M6.2 12.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3 6.7C2.4 8 2 9.5 2 11s.4 3 1 4.3l3.2-2.5Z" />
      <path fill="#FBBC05" d="M12 5c1.5 0 2.9.5 4 1.5l3-3C17 1.7 14.7 1 12 1 8.1 1 4.7 3.3 3 6.7l3.2 2.5C7 6.8 9.3 5 12 5Z" />
    </svg>
  );
}

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(() => searchParams.get("callbackUrl") ?? "/dashboard", [searchParams]);

  return (
    <div className="page-frame flex min-h-[70vh] max-w-xl items-center py-12">
      <Card className="w-full shadow-glow">
        <CardHeader className="hero-mesh border-b border-border/70">
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Continue with Google to save favorites, submit tools, and unlock your personalized workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button type="button" className="w-full" onClick={() => signIn("google", { callbackUrl })}>
            <GoogleMark />
            <span className="ml-2">Continue with Google</span>
          </Button>
          <div className="rounded-[1.2rem] border border-border/70 bg-secondary/35 p-4 text-sm text-muted-foreground">
            Admin access is determined by the role on your account. If your Google email is marked as admin in the
            database or matches <code>ADMIN_EMAIL</code>, the admin panel unlocks automatically.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
