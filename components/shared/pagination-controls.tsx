import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function PaginationControls({
  page,
  totalPages,
  buildHref
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="surface-card mt-10 flex items-center justify-between gap-4 px-5 py-4">
      {page <= 1 ? (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={buildHref(page - 1)}>Previous</Link>
        </Button>
      )}
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      {page >= totalPages ? (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href={buildHref(page + 1)}>Next</Link>
        </Button>
      )}
    </div>
  );
}
