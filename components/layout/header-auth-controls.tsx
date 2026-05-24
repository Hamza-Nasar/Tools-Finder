"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export function HeaderAuthControls({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const callbackUrl = pathname && !pathname.startsWith("/auth/") ? pathname : "/dashboard";

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
        {!compact ? (
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href={`/auth/login?callbackUrl=${encodeURIComponent("/submit")}`}>Submit Tool</Link>
          </Button>
        ) : null}
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
      {!compact ? (
        <>
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/submit">Submit Tool</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden items-center gap-2 xl:inline-flex">
            <Link href="/favorites">
              <HeartIcon />
              <span className="hidden 2xl:inline">Favorites</span>
            </Link>
          </Button>
        </>
      ) : null}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <motion.button
            type="button"
            className="interactive-control flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-2 py-2 shadow-sm hover:border-border hover:bg-white"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "Signed-in user"} referrerPolicy="no-referrer" />
              <AvatarFallback className="bg-primary/12 font-semibold text-primary">
                {getInitials(session.user.name, session.user.email)}
              </AvatarFallback>
            </Avatar>
            {!compact ? (
              <span className="hidden text-left lg:block">
                <span className="block text-sm font-medium text-foreground">{session.user.name ?? "Signed in"}</span>
                <span className="block text-xs text-muted-foreground">Account</span>
              </span>
            ) : null}
            <span className="text-muted-foreground">
              <ChevronIcon open={false} />
            </span>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>
            <p className="text-sm font-semibold text-foreground">{session.user.name ?? "Signed in"}</p>
            <p className="text-xs font-normal text-muted-foreground">{session.user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/dashboard#submitted-tools", label: "My Submissions" },
            { href: "/my-stack", label: "My Stack" },
            { href: "/favorites", label: "Favorites" },
            ...(session.user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : [])
          ].map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              void signOut({ callbackUrl: "/" });
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
