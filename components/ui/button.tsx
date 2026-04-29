"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";
import { cn } from "@/lib/utils";

type MotionButtonProps = React.ComponentPropsWithoutRef<typeof motion.button>;

const buttonVariants = cva(
  "interactive-control inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] text-sm font-semibold motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_[data-icon]]:size-4 [&_[data-icon]]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-secondary-foreground to-primary text-primary-foreground shadow-premium hover:opacity-95 hover:shadow-floating",
        outline: "border border-border bg-white/85 shadow-sm hover:bg-white hover:shadow-premium",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/85",
        ghost: "bg-transparent hover:bg-white/75"
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-6 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const reduceMotion = useSsrSafeReducedMotion();
    const resolvedClassName = cn(buttonVariants({ variant, size, className }));

    if (asChild) {
      return <Slot className={resolvedClassName} ref={ref} {...props} />;
    }

    return (
      <motion.button
        className={resolvedClassName}
        ref={ref}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        whileHover={reduceMotion ? undefined : { y: -1, scale: 1.01 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        {...(props as unknown as MotionButtonProps)}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
