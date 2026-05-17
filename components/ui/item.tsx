import * as React from "react";
import { cn } from "@/lib/utils";

export function Item({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border/70 bg-white/80 px-3 py-2",
        className
      )}
      {...props}
    />
  );
}
