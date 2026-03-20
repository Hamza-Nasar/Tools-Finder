import { MotionReveal } from "@/components/shared/motion-reveal";
import { cn } from "@/lib/utils";

export function PageSkeleton({
  cards = 6,
  compact = false
}: {
  cards?: number;
  compact?: boolean;
}) {
  return (
    <div className="page-frame py-12">
      <MotionReveal
        className={cn("surface-card hero-mesh p-8 md:p-10", compact ? "min-h-[220px]" : "min-h-[320px]")}
        y={16}
      >
        <div className="max-w-3xl space-y-4">
          <div className="skeleton-shimmer h-8 w-32" />
          <div className="skeleton-shimmer h-16 w-full max-w-2xl" />
          <div className="skeleton-shimmer h-6 w-full max-w-xl" />
          <div className="skeleton-shimmer h-6 w-3/4 max-w-lg" />
        </div>
      </MotionReveal>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <MotionReveal key={index} delay={index * 0.04} className="surface-card p-6" y={14}>
            <div className="skeleton-shimmer h-16 w-16 rounded-[1.4rem]" />
            <div className="mt-6 space-y-3">
              <div className="skeleton-shimmer h-5 w-24" />
              <div className="skeleton-shimmer h-8 w-3/4" />
              <div className="skeleton-shimmer h-4 w-full" />
              <div className="skeleton-shimmer h-4 w-5/6" />
            </div>
          </MotionReveal>
        ))}
      </div>
    </div>
  );
}
