import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-[var(--radius-control)] border border-input bg-white/88 px-3.5 py-2 text-sm shadow-sm outline-none transition-[background-color,border-color,box-shadow] duration-300 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
