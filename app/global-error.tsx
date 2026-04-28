"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <div className="page-frame flex min-h-screen items-center py-12">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>We hit an unexpected runtime issue</CardTitle>
              <CardDescription>
                The app recovered safely. Retry this page or continue from the homepage.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={reset}>Try again</Button>
              <Button asChild variant="outline">
                <Link href="/">Go home</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/tools">Open directory</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
