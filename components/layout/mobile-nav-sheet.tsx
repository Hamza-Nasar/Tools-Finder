"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { NavItem } from "@/types";

export function MobileNavSheet({
  navItems,
  isAuthenticated,
  isAdmin
}: {
  navItems: NavItem[];
  isAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const secondaryLinks = [
    { href: isAuthenticated ? "/submit" : "/auth/sign-in?callbackUrl=%2Fsubmit", label: "Submit Tool" },
    ...(isAuthenticated
      ? [
          { href: "/my-stack", label: "My Stack" },
          { href: "/favorites", label: "Favorites" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard#submitted-tools", label: "My Submissions" },
          ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : [])
        ]
      : [{ href: "/auth/sign-in?callbackUrl=%2Fdashboard", label: "Sign in with Google" }])
  ];

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="relative md:hidden">
      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-white/80 text-muted-foreground shadow-sm transition hover:bg-white"
        aria-label="Toggle navigation"
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      >
        <motion.svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
          animate={reduceMotion ? undefined : open ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.2 }}
        >
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l10 10M15 5 5 15" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h14M3 10h14M3 15h14" />
          )}
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-foreground/12 backdrop-blur-sm"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 w-[min(22rem,calc(100vw-1rem))] p-3"
            >
              <div className="surface-card flex h-full flex-col rounded-[1.6rem] border border-border/70 bg-background/95 p-3 shadow-floating backdrop-blur-xl">
                <div className="mb-2 flex items-center justify-between border-b border-border/70 px-2 pb-3 pt-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Navigation</p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-border/70 bg-white/85 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-white"
                  >
                    Close
                  </button>
                </div>
                <div className="grid gap-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-2 border-t border-border/70" />
                  {secondaryLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
