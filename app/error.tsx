"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function looksLikeDatabaseError(message: string) {
  return [
    "MongooseServerSelectionError",
    "MongoNetworkError",
    "ECONNREFUSED",
    "ENOTFOUND",
    "MONGODB_URI"
  ].some((token) => message.includes(token));
}

export default function RootError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const databaseIssue = looksLikeDatabaseError(error.message);

  return (
    <div className="page-frame flex min-h-[70vh] items-center py-12">
      <Card className="w-full max-w-2xl shadow-glow">
        <CardHeader className="hero-mesh border-b border-border/70">
          <CardTitle>{databaseIssue ? "Database connection issue" : "Something went wrong"}</CardTitle>
          <CardDescription>
            {databaseIssue
              ? "The app could not reach MongoDB. In local development, verify that your database is running and that MONGODB_URI is correct."
              : "An unexpected server error interrupted the request. You can retry the page or return to the homepage."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/tools">Browse tools</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
