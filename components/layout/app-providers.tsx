"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { NewsletterExitIntent } from "@/components/shared/newsletter-exit-intent";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      {children}
      <NewsletterExitIntent />
      <Toaster richColors position="top-right" />
    </SessionProvider>
  );
}
