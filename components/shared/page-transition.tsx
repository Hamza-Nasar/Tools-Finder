"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";

export function PageTransition({ children }: { children: ReactNode }) {
  const reduceMotion = useSsrSafeReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0.985 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
