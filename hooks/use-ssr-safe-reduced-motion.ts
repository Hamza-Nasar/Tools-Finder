"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function useSsrSafeReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Keep SSR and the first client render aligned. Motion is enabled after hydration
  // only when the user doesn't prefer reduced motion.
  return hasMounted ? prefersReducedMotion === true : true;
}
