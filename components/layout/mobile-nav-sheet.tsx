"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";
import type { NavItem } from "@/types";

export function MobileNavSheet({
  navItems,
  isAuthenticated,
  isAdmin,
  userName,
  userEmail
}: {
  navItems: NavItem[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useSsrSafeReducedMotion();
  const pathname = usePathname();

  const secondaryLinks = [
    { href: isAuthenticated ? "/submit" : "/auth/login?callbackUrl=%2Fsubmit", label: "Submit Tool" },
    ...(isAuthenticated
      ? [
          { href: "/my-stack", label: "My Stack" },
          { href: "/favorites", label: "Favorites" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/dashboard#submitted-tools", label: "My Submissions" },
          ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : [])
        ]
      : [
          { href: "/auth/login?callbackUrl=%2Fdashboard", label: "Login" },
          { href: "/auth/signup?callbackUrl=%2Fdashboard", label: "Create account" }
        ])
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        className="interactive-control flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-white/80 text-muted-foreground shadow-sm hover:bg-white"
        aria-label="Toggle navigation"
        aria-expanded={open}
        aria-controls="mobile-navigation-sheet"
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

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <>
                  <motion.button
                    type="button"
                    aria-label="Close navigation"
                    className="fixed inset-0 z-[70] bg-foreground/12 backdrop-blur-sm"
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
                    className="fixed inset-y-0 right-0 z-[80] w-[min(22rem,calc(100vw-1rem))] p-3"
                  >
                    <div
                      id="mobile-navigation-sheet"
                      className="surface-card flex h-full max-h-[calc(100vh-1.5rem)] flex-col rounded-[1.6rem] border border-border/70 bg-background/95 p-3 shadow-floating backdrop-blur-xl"
                    >
                      <div className="mb-2 border-b border-border/70 px-2 pb-3 pt-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Navigation</p>
                            {isAuthenticated ? (
                              <div className="mt-1 min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">{userName ?? "Signed in"}</p>
                                <p className="truncate text-xs text-muted-foreground">{userEmail ?? "Manage your account"}</p>
                              </div>
                            ) : (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Browse the directory, compare tools, and sign in from one menu.
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="interactive-control shrink-0 rounded-full border border-border/70 bg-white/85 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-white"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                      <div className="grid gap-1 overflow-y-auto pb-3">
                        <p className="px-4 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Explore
                        </p>
                        {navItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="interactive-control rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-white"
                          >
                            {item.label}
                          </Link>
                        ))}
                        <div className="my-2 border-t border-border/70" />
                        <p className="px-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Account
                        </p>
                        {secondaryLinks.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="interactive-control rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-white"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            void signOut({ callbackUrl: "/" });
                          }}
                          className="interactive-control mt-auto rounded-2xl border border-border/70 bg-white/85 px-4 py-3 text-left text-sm font-medium text-foreground shadow-sm hover:bg-white"
                        >
                          Logout
                        </button>
                      ) : null}
                    </div>
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </div>
  );
}
