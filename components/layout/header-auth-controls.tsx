"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
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

export function HeaderAuthControls() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const callbackUrl = pathname && pathname !== "/auth/sign-in" ? pathname : "/favorites";

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer hidden h-9 w-28 rounded-full md:block" />
        <div className="skeleton-shimmer h-10 w-10 rounded-full" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex"
          onClick={() => signIn("google", { callbackUrl })}
        >
          Sign in with Google
        </Button>
        <Button asChild size="sm">
          <Link href="/submit">Submit a tool</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
        <Link href="/favorites">Favorites</Link>
      </Button>
      {session.user.role === "admin" ? (
        <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
          <Link href="/admin">Admin</Link>
        </Button>
      ) : null}
      <Button asChild size="sm" className="hidden md:inline-flex">
        <Link href="/submit">Submit a tool</Link>
      </Button>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex items-center gap-3 rounded-full border border-border/70 bg-white/80 px-2 py-2 shadow-sm transition hover:border-border hover:bg-white"
        aria-label="Open account menu"
      >
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? "Signed-in user"}
            className="h-9 w-9 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/12 font-semibold text-primary">
            {getInitials(session.user.name, session.user.email)}
          </span>
        )}
        <span className="hidden text-left md:block">
          <span className="block text-sm font-medium text-foreground">{session.user.name ?? "Signed in"}</span>
          <span className="block text-xs text-muted-foreground">Sign out</span>
        </span>
      </button>
    </div>
  );
}
