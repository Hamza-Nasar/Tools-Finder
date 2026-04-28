"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";
import type { NavItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

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
  const reduceMotion = useSsrSafeReducedMotion();
  const pathname = usePathname();

  const secondaryLinks = useMemo(
    () => [
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
    ],
    [isAdmin, isAuthenticated]
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <motion.button
            type="button"
            className="interactive-control inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-white/[0.82] text-muted-foreground shadow-sm hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_[data-icon]]:size-5"
            aria-label="Open navigation"
            whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          >
            <Menu data-icon="inline" />
          </motion.button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[min(23rem,calc(100vw-1rem))] border-border/70 p-0 sm:max-w-sm"
        >
          <div id="mobile-navigation-sheet" className="flex h-full flex-col overflow-hidden">
            <SheetHeader className="border-b border-border/70 px-5 pb-4 pr-14 pt-5 text-left">
              <SheetTitle className="text-sm uppercase tracking-[0.18em] text-primary">
                Navigation
              </SheetTitle>
              <SheetDescription>
                {isAuthenticated
                  ? `${userName ?? "Signed in"}${userEmail ? ` - ${userEmail}` : ""}`
                  : "Browse the directory, compare tools, and sign in from one menu."}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
              <div className="flex flex-col gap-1">
                <p className="px-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Explore
                </p>
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.025, duration: 0.22 }}
                  >
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className="interactive-control block rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-white"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  </motion.div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-col gap-1">
                <p className="px-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Account
                </p>
                {secondaryLinks.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + index) * 0.025, duration: 0.22 }}
                  >
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className="interactive-control block rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-white"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  </motion.div>
                ))}
              </div>
            </div>

            {isAuthenticated ? (
              <div className="border-t border-border/70 p-3">
                <Button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void signOut({ callbackUrl: "/" });
                  }}
                  variant="outline"
                  className="w-full justify-start rounded-2xl"
                >
                  Logout
                </Button>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

