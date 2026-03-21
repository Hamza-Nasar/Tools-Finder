"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { Button } from "@/components/ui/button";

const DISALLOWED_PATH_PREFIXES = ["/admin", "/auth"];
const DISALLOWED_PATHS = new Set(["/dashboard", "/favorites", "/submit", "/my-stack"]);

export function NewsletterExitIntent() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    if (!pathname) {
      return undefined;
    }

    if (DISALLOWED_PATHS.has(pathname) || DISALLOWED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return undefined;
    }

    if (!window.matchMedia("(pointer:fine)").matches || window.innerWidth < 1024) {
      return undefined;
    }

    const storageKey = "newsletter-exit-intent-dismissed";

    if (window.sessionStorage.getItem(storageKey)) {
      return undefined;
    }

    const handleMouseOut = (event: MouseEvent) => {
      if (event.clientY > 16 || event.relatedTarget) {
        return;
      }

      setIsOpen(true);
      window.sessionStorage.setItem(storageKey, "1");
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-3xl"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-3 top-3 z-10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <NewsletterForm
              source="exit-intent"
              title="Before you go, get the highest-signal AI tools in one digest."
              description="Join the weekly newsletter for standout launches, trending tools, prompt packs, and workflow ideas without the noise."
              buttonLabel="Get the digest"
              onSuccess={() => setIsOpen(false)}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
