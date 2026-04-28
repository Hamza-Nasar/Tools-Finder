"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { safeApiRequest } from "@/lib/client-api";

interface VendorClaimFormProps {
  enabled: boolean;
  defaultEmail: string;
}

export function VendorClaimForm({ enabled, defaultEmail }: VendorClaimFormProps) {
  const [toolSlug, setToolSlug] = useState("");
  const [companyEmail, setCompanyEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitClaim() {
    try {
      setLoading(true);
      setStatus(null);
      const result = await safeApiRequest("/api/vendor/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          toolSlug: toolSlug.trim(),
          companyEmail: companyEmail.trim(),
          message: message.trim() || null
        })
      });

      if (!result.ok) {
        throw new Error(result.error ?? "Could not submit claim.");
      }

      setStatus("Claim submitted for review.");
      setToolSlug("");
      setMessage("");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not submit claim.";
      setStatus(detail);
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) {
    return (
      <div className="rounded-[1rem] border border-dashed border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
        Vendor claims require the Vendor plan.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Input
        value={toolSlug}
        onChange={(event) => setToolSlug(event.target.value)}
        placeholder="Tool slug to claim"
      />
      <Input
        value={companyEmail}
        onChange={(event) => setCompanyEmail(event.target.value)}
        placeholder="Company email"
      />
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Short proof that you own or represent this product"
      />
      <Button disabled={loading || !toolSlug.trim()} onClick={() => void submitClaim()}>
        {loading ? "Submitting..." : "Submit claim"}
      </Button>
      {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
    </div>
  );
}
