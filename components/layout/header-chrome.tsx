"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll, useReducedMotion } from "framer-motion";

export function HeaderChrome({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const [isElevated, setIsElevated] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    setIsElevated(value > 10);
  });

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-2xl"
      animate={
        reduceMotion
          ? undefined
          : {
              backgroundColor: isElevated ? "rgba(247, 244, 239, 0.88)" : "rgba(247, 244, 239, 0.72)",
              boxShadow: isElevated
                ? "0 10px 38px rgba(20, 28, 44, 0.08)"
                : "0 0 0 rgba(20, 28, 44, 0)"
            }
      }
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.header>
  );
}
