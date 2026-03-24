"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";
import { Button } from "@/components/ui/button";

function getInitials(name?: string | null, email?: string | null) {
  const fallback = name?.trim() || email?.trim() || "User";
  return fallback
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12 20-1.45-1.32C5.4 14.03 2 10.93 2 7.12 2 4.02 4.42 2 7.2 2c1.57 0 3.08.75 4.03 1.93A5.2 5.2 0 0 1 15.27 2C18.05 2 20.47 4.02 20.47 7.12c0 3.8-3.4 6.9-8.55 11.56L12 20Z"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 8 5 5 5-5" />
    </svg>
  );
}

export function HeaderAuthControls() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useSsrSafeReducedMotion();
  const callbackUrl = pathname && !pathname.startsWith("/auth/") ? pathname : "/dashboard";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <div className="skeleton-shimmer hidden h-10 w-28 rounded-full md:block" />
        <div className="skeleton-shimmer h-10 w-10 rounded-full" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link href={`/auth/login?callbackUrl=${encodeURIComponent("/submit")}`}>Submit Tool</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <span className="md:hidden">Sign in</span>
            <span className="hidden md:inline">Login</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Button asChild size="sm" className="hidden md:inline-flex">
        <Link href="/submit">Submit Tool</Link>
      </Button>
      <Button asChild variant="ghost" size="sm" className="hidden items-center gap-2 md:inline-flex">
        <Link href="/favorites">
          <HeartIcon />
          <span>Favorites</span>
        </Link>
      </Button>

      <div ref={menuRef} className="relative">
        <motion.button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="interactive-control flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-2 py-2 shadow-sm hover:border-border hover:bg-white"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Open account menu"
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        >
          {session.user.image ? (
            <motion.img
              src={session.user.image}
              alt={session.user.name ?? "Signed-in user"}
              className="h-9 w-9 rounded-full object-cover"
              referrerPolicy="no-referrer"
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            />
          ) : (
            <motion.span
              className="grid h-9 w-9 place-items-center rounded-full bg-primary/12 font-semibold text-primary"
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
            >
              {getInitials(session.user.name, session.user.email)}
            </motion.span>
          )}
          <span className="hidden text-left lg:block">
            <span className="block text-sm font-medium text-foreground">{session.user.name ?? "Signed in"}</span>
            <span className="block text-xs text-muted-foreground">Account</span>
          </span>
          <span className="hidden text-muted-foreground md:block">
            <ChevronIcon open={menuOpen} />
          </span>
        </motion.button>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-60 rounded-[1.4rem] border border-border/70 bg-background/95 p-2 shadow-floating backdrop-blur-xl"
            >
              <div className="border-b border-border/70 px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{session.user.name ?? "Signed in"}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
              <motion.div layout className="grid gap-1 px-1 py-2">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/dashboard#submitted-tools", label: "My Submissions" },
                  { href: "/my-stack", label: "My Stack" },
                  { href: "/favorites", label: "Favorites" },
                  ...(session.user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : [])
                ].map((item) => (
                  <motion.div key={item.href} whileHover={reduceMotion ? undefined : { x: 2 }}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="interactive-control block rounded-2xl px-3 py-2 text-sm font-medium text-foreground hover:bg-white"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              <div className="border-t border-border/70 px-1 pt-2">
                <motion.button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut({ callbackUrl: "/" });
                  }}
                  className="interactive-control flex w-full items-center rounded-2xl px-3 py-2 text-sm font-medium text-foreground hover:bg-white"
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
