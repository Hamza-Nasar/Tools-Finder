import { MotionReveal } from "@/components/shared/motion-reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
      <MotionReveal y={16}>
        <Card className={cn("hero-mesh p-8 md:p-10", compact ? "min-h-[220px]" : "min-h-[320px]")}>
          <CardContent className="max-w-3xl space-y-4 p-0">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-16 w-full max-w-2xl" />
            <Skeleton className="h-6 w-full max-w-xl" />
            <Skeleton className="h-6 w-3/4 max-w-lg" />
          </CardContent>
        </Card>
      </MotionReveal>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <MotionReveal key={index} delay={index * 0.04} y={14}>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-16 rounded-[1.4rem]" />
                <div className="mt-6 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          </MotionReveal>
        ))}
      </div>
    </div>
  );
}
