"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PromptEntry } from "@/types";
import { useSsrSafeReducedMotion } from "@/hooks/use-ssr-safe-reduced-motion";
import { MotionReveal } from "@/components/shared/motion-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PromptCard({ prompt }: { prompt: PromptEntry }) {
  const [copied, setCopied] = useState(false);
  const reduceMotion = useSsrSafeReducedMotion();

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <MotionReveal className="h-full" y={16}>
      <Card className="surface-card-hover h-full overflow-hidden">
        <CardHeader className="border-b border-border/70">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">{prompt.toolName}</Badge>
            <Badge>{prompt.category}</Badge>
          </div>
          <CardTitle className="mt-3">{prompt.title}</CardTitle>
          <CardDescription className="mt-2">{prompt.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <pre className="overflow-hidden whitespace-pre-wrap rounded-[1.4rem] border border-border/70 bg-white/70 p-4 text-sm leading-7 text-muted-foreground">
            {prompt.prompt}
          </pre>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => void handleCopy()}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "copied" : "copy"}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                >
                  {copied ? "Copied" : "Copy prompt"}
                </motion.span>
              </AnimatePresence>
            </Button>
            <Button asChild variant="outline" type="button">
              <Link href={`/prompts/${prompt.toolSlug}`}>More {prompt.toolName} prompts</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </MotionReveal>
  );
}
