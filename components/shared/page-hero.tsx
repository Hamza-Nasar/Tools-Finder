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
    <section className={cn("surface-card hero-mesh relative overflow-hidden p-7 md:p-10", className)}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/[0.35] to-transparent" />
      <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
        <MotionReveal className="max-w-3xl" y={24}>
          <p className="inline-flex rounded-full border border-primary/[0.15] bg-primary/[0.08] px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
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
                className="surface-card-hover rounded-[1.35rem] border border-white/75 bg-white/[0.82] px-5 py-4 shadow-sm backdrop-blur"
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
