"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const currentPath = usePathname();

  return (
    <div className="page-frame grid gap-8 py-10 lg:grid-cols-[280px_1fr]">
      <aside className="section-shell hero-mesh p-5 lg:sticky lg:top-24 lg:h-fit">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold">
          Platform control
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Moderate submissions, shape the taxonomy, and control homepage inventory from one workspace.
        </p>
        <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {adminNav.map((item) => {
            const isActive = currentPath === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[1.1rem] px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-gradient-to-r from-primary via-secondary-foreground to-primary text-primary-foreground shadow-sm"
                    : "border border-transparent text-muted-foreground hover:border-border/80 hover:bg-white/86 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
