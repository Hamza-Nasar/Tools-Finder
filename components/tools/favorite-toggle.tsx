"use client";

import { useRouter } from "next/navigation";
import { startTransition, useOptimistic, useState } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/actions/favorite-actions";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";
import { Button } from "@/components/ui/button";

interface FavoriteToggleProps {
  toolId: string;
  toolSlug: string;
  initialIsFavorited: boolean;
}

export function FavoriteToggle({
  toolId,
  toolSlug,
  initialIsFavorited
}: FavoriteToggleProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const reduceMotion = useSsrSafeReducedMotion();
  const [isFavorited, updateOptimisticFavorite] = useOptimistic(
    initialIsFavorited,
    (_, nextState: boolean) => nextState
  );

  function handleToggle() {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/tools/${toolSlug}`)}`);
      return;
    }

    setIsPending(true);

    startTransition(async () => {
      updateOptimisticFavorite(!isFavorited);

      try {
        await toggleFavoriteAction(toolId, ["/favorites", `/tools/${toolSlug}`]);
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <motion.div whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
      <Button
        type="button"
        variant={isFavorited ? "secondary" : "outline"}
        onClick={handleToggle}
        disabled={isPending}
        className="min-w-[9rem]"
      >
        <motion.span
          animate={reduceMotion ? undefined : isFavorited ? { scale: [1, 1.22, 1], rotate: [0, -8, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mr-2 inline-flex"
        >
          <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        </motion.span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isFavorited ? "saved" : "save"}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {isFavorited ? "Saved" : "Save tool"}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
