import type { ReactNode } from "react";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className
}: SectionHeadingProps) {
  return (
    <MotionReveal
      className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}
      y={18}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="inline-flex rounded-full border border-primary/15 bg-primary/[0.08] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 font-[family-name:var(--font-heading)] text-[2rem] font-bold leading-tight md:text-[3rem]">
          {title}
        </h2>
        {description ? <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </MotionReveal>
  );
}
