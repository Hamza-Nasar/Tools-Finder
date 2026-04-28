"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { safeApiRequest } from "@/lib/client-api";

interface ToolVendorActionsProps {
  toolSlug: string;
  defaultEmail?: string | null;
  userPlan?: "free" | "pro" | "vendor" | null;
}

export function ToolVendorActions({ toolSlug, defaultEmail, userPlan }: ToolVendorActionsProps) {
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState(defaultEmail ?? "");
  const [leadUseCase, setLeadUseCase] = useState("");
  const [claimEmail, setClaimEmail] = useState(defaultEmail ?? "");
  const [claimMessage, setClaimMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<null | "lead" | "claim">(null);

  async function submitLead() {
    try {
      setLoading("lead");
      setStatus(null);
      const result = await safeApiRequest("/api/vendor/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug,
          sourcePath: `/tools/${toolSlug}`,
          contactName: leadName.trim(),
          contactEmail: leadEmail.trim(),
          useCase: leadUseCase.trim(),
          budget: "unknown"
        })
      });

      if (!result.ok) {
        throw new Error(result.error ?? "Lead submit failed.");
      }

      setStatus("Lead request submitted.");
      setLeadName("");
      setLeadUseCase("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Lead submit failed.");
    } finally {
      setLoading(null);
    }
  }

  async function submitClaim() {
    try {
      setLoading("claim");
      setStatus(null);
      const result = await safeApiRequest("/api/vendor/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug,
          companyEmail: claimEmail.trim(),
          message: claimMessage.trim() || null
        })
      });

      if (!result.ok) {
        throw new Error(result.error ?? "Claim submit failed.");
      }

      setStatus("Vendor claim submitted.");
      setClaimMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Claim submit failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1rem] border border-border/70 bg-background/40 p-4">
        <p className="text-sm font-semibold text-foreground">Need a demo or custom plan?</p>
        <p className="mt-1 text-xs text-muted-foreground">Send a qualified lead request directly from this page.</p>
        <div className="mt-3 space-y-2">
          <Input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Your name" />
          <Input value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Work email" />
          <Textarea
            value={leadUseCase}
            onChange={(e) => setLeadUseCase(e.target.value)}
            placeholder="Describe your use case"
          />
          <Button disabled={loading !== null} onClick={() => void submitLead()}>
            {loading === "lead" ? "Sending..." : "Send lead"}
          </Button>
        </div>
      </div>

      <div className="rounded-[1rem] border border-border/70 bg-background/40 p-4">
        <p className="text-sm font-semibold text-foreground">Own this tool?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Vendor claim unlocks profile controls and analytics.
          {userPlan !== "vendor" ? " Vendor plan required for approval workflow." : ""}
        </p>
        <div className="mt-3 space-y-2">
          <Input value={claimEmail} onChange={(e) => setClaimEmail(e.target.value)} placeholder="Company email" />
          <Textarea
            value={claimMessage}
            onChange={(e) => setClaimMessage(e.target.value)}
            placeholder="Proof of ownership (optional)"
          />
          <Button
            variant="outline"
            disabled={loading !== null || userPlan !== "vendor"}
            onClick={() => void submitClaim()}
          >
            {loading === "claim" ? "Submitting..." : "Submit claim"}
          </Button>
          {userPlan !== "vendor" ? (
            <p className="text-xs text-muted-foreground">
              Upgrade to Vendor from{" "}
              <Link href="/pricing" className="font-medium text-primary underline-offset-2 hover:underline">
                pricing
              </Link>{" "}
              to enable claims.
            </p>
          ) : null}
        </div>
      </div>

      {status ? <p className="text-xs text-muted-foreground">{status}</p> : null}
    </div>
  );
}
