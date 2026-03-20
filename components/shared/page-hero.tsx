import type { ReactNode } from "react";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { cn } from "@/lib/utils";

interface PageHeroStat {
  label: string;
  value: string;
  detail?: string;
}

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  stats?: PageHeroStat[];
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  stats = [],
  className
}: PageHeroProps) {
  return (
    <section className={cn("surface-card hero-mesh relative overflow-hidden p-8 md:p-10", className)}>
      <div className="absolute -left-10 top-12 h-40 w-40 rounded-full bg-secondary/45 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
        <MotionReveal className="max-w-3xl" y={24}>
          <p className="inline-flex rounded-full border border-primary/15 bg-primary/8 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-heading)] text-[2.5rem] font-bold leading-[1.02] md:text-[4.25rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
            {description}
          </p>
          {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
        </MotionReveal>

        {stats.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {stats.map((stat, index) => (
              <MotionReveal
                key={stat.label}
                delay={index * 0.06}
                className="rounded-[1.5rem] border border-white/75 bg-white/82 px-5 py-4 shadow-sm backdrop-blur"
              >
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary">
                  {stat.label}
                </p>
                <p className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold md:text-4xl">
                  {stat.value}
                </p>
                {stat.detail ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.detail}</p> : null}
              </MotionReveal>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
