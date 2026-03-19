import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <span className="rounded-full border border-border bg-card px-4 py-1 text-sm font-medium text-muted-foreground">
        404
      </span>
      <h1 className="mt-6 font-[family-name:var(--font-heading)] text-4xl font-bold">
        The page you requested does not exist.
      </h1>
      <p className="mt-4 max-w-xl text-balance text-lg text-muted-foreground">
        Try the tools directory, browse categories, or head back to the homepage to continue.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Return home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/tools">Browse tools</Link>
        </Button>
      </div>
    </div>
  );
}
