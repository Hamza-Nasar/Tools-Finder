import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[0.7rem] font-semibold tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "border-secondary/80 bg-secondary/80 text-secondary-foreground",
        muted: "border-border bg-white/70 text-muted-foreground",
        accent: "border-accent/80 bg-accent/80 text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
