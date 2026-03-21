"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";
import { cn } from "@/lib/utils";

interface MotionRevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  y?: number;
}

export function MotionReveal({
  children,
  className,
  delay = 0,
  once = true,
  y = 18,
  transition,
  whileHover,
  whileTap,
  ...props
}: MotionRevealProps) {
  const reduceMotion = useSsrSafeReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.18 }}
      transition={
        transition ?? {
          duration: 0.42,
          delay,
          ease: [0.22, 1, 0.36, 1]
        }
      }
      whileHover={reduceMotion ? undefined : whileHover}
      whileTap={reduceMotion ? undefined : whileTap}
      {...props}
    >
      {children}
    </motion.div>
  );
}
