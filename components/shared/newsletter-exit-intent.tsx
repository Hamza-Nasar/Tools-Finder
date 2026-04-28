"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

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

    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, [pathname]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Newsletter signup</DialogTitle>
          <DialogDescription>
            Subscribe to receive the weekly AI tools digest before leaving the page.
          </DialogDescription>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <NewsletterForm
            source="exit-intent"
            title="Before you go, get the highest-signal AI tools in one digest."
            description="Join the weekly newsletter for standout launches, trending tools, prompt packs, and workflow ideas without the noise."
            buttonLabel="Get the digest"
            onSuccess={() => setIsOpen(false)}
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
