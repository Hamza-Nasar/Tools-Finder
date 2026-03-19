"use client";

import { startTransition, useOptimistic, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/lib/actions/favorite-actions";
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
  const [isPending, setIsPending] = useState(false);
  const [isFavorited, updateOptimisticFavorite] = useOptimistic(
    initialIsFavorited,
    (_, nextState: boolean) => nextState
  );

  function handleToggle() {
    if (!session?.user) {
      void signIn("google", { callbackUrl: `/tools/${toolSlug}` });
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
    <Button type="button" variant={isFavorited ? "secondary" : "outline"} onClick={handleToggle} disabled={isPending}>
      <Heart className={`mr-2 h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
      {isFavorited ? "Saved" : "Save tool"}
    </Button>
  );
}
