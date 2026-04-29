"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";

export function HeaderChrome({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const reduceMotion = useSsrSafeReducedMotion();
  const [isElevated, setIsElevated] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    setIsElevated(value > 10);
  });

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/65 bg-background/[0.8] backdrop-blur-2xl"
      initial={false}
      animate={
        reduceMotion
          ? undefined
          : {
              backgroundColor: isElevated ? "hsla(210, 40%, 99%, 0.94)" : "hsla(210, 40%, 99%, 0.8)",
              boxShadow: isElevated
                ? "0 12px 36px rgba(8, 47, 73, 0.1)"
                : "0 0 0 rgba(8, 47, 73, 0)"
            }
      }
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.header>
  );
}
