"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AdminLiveRefresh({ intervalMs = 20000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, router]);

  return null;
}

