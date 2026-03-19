import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
  label?: string;
}

export function EmptyState({ title, description, ctaHref, ctaLabel, label = "Empty" }: EmptyStateProps) {
  return (
    <div className="surface-card rounded-[2rem] border-dashed px-6 py-14 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-border bg-white/80 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        {label}
      </div>
      <h3 className="mt-6 font-[family-name:var(--font-heading)] text-2xl font-semibold">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-muted-foreground">{description}</p>
      {ctaHref && ctaLabel ? (
        <Button asChild className="mt-6">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
