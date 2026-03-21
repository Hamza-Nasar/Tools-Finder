"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  source: "homepage" | "tool-page" | "exit-intent";
  toolSlug?: string | null;
  pagePath?: string;
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
  buttonLabel?: string;
  onSuccess?: () => void;
}

export function NewsletterForm({
  source,
  toolSlug,
  pagePath,
  title = "Get the best AI tools in your inbox.",
  description = "A concise weekly digest of standout launches, comparisons, workflows, and prompts.",
  compact = false,
  className,
  buttonLabel = "Join newsletter",
  onSuccess
}: NewsletterFormProps) {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const resolvedPath = useMemo(() => pagePath ?? pathname ?? "/", [pagePath, pathname]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Enter an email address.");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          source,
          pagePath: resolvedPath,
          toolSlug: toolSlug ?? undefined
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            data?: { subscribed?: boolean; limited?: boolean };
            subscribed?: boolean;
            limited?: boolean;
            error?: string;
          }
        | null;
      const limited = payload?.data?.limited ?? payload?.limited ?? false;

      if (!response.ok || limited) {
        throw new Error(payload?.error ?? "Subscription could not be completed right now.");
      }

      setStatus("success");
      setMessage("You're on the list. Watch for the next AI tools roundup.");
      setEmail("");
      onSuccess?.();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Subscription could not be completed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("surface-card hero-mesh overflow-hidden p-6 md:p-8", className)}>
      <div className={cn("grid gap-5", compact ? "lg:grid-cols-[1.1fr_0.9fr] lg:items-center" : "lg:grid-cols-[1fr_1.05fr] lg:items-center")}>
        <div className={compact ? "max-w-xl" : "max-w-2xl"}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Newsletter</p>
          <h2 className={cn("mt-3 font-[family-name:var(--font-heading)] font-semibold", compact ? "text-2xl" : "text-3xl md:text-4xl")}>
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`newsletter-email-${source}`}>Email address</Label>
            <Input
              id={`newsletter-email-${source}`}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              className="bg-white/90"
            />
          </div>
          <motion.div whileTap={{ scale: 0.985 }}>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Joining..." : buttonLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
          {message ? (
            <div
              className={cn(
                "flex items-start gap-2 rounded-[1.1rem] border px-4 py-3 text-sm",
                status === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              )}
            >
              {status === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : null}
              <span>{message}</span>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
