"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { safeApiRequest } from "@/lib/client-api";

interface VendorClaimRecord {
  id: string;
  toolId: string;
  userId: string;
  companyEmail: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  moderationNote: string | null;
  createdAt: string | null;
}

export function VendorClaimsConsole({ claims }: { claims: VendorClaimRecord[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  async function updateClaim(claimId: string, status: "approved" | "rejected") {
    try {
      setPendingId(claimId);
      const result = await safeApiRequest("/api/admin/vendor/claims", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          claimId,
          status,
          moderationNote: noteMap[claimId] ?? null
        })
      });

      if (!result.ok) {
        throw new Error(result.error ?? "Claim update failed.");
      }

      router.refresh();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Claim update failed.";
      window.alert(detail);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {claims.map((claim) => (
        <Card key={claim.id}>
          <CardHeader className="border-b border-border/70">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{claim.companyEmail}</CardTitle>
                <CardDescription>Tool ID: {claim.toolId}</CardDescription>
              </div>
              <Badge variant={claim.status === "approved" ? "accent" : claim.status === "rejected" ? "default" : "muted"}>
                {claim.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">{claim.message ?? "No message provided."}</p>
            <Textarea
              value={noteMap[claim.id] ?? claim.moderationNote ?? ""}
              onChange={(event) => setNoteMap((prev) => ({ ...prev, [claim.id]: event.target.value }))}
              placeholder="Moderation note"
            />
            <div className="flex gap-2">
              <Button disabled={pendingId === claim.id} onClick={() => void updateClaim(claim.id, "approved")}>
                Approve
              </Button>
              <Button
                variant="outline"
                disabled={pendingId === claim.id}
                onClick={() => void updateClaim(claim.id, "rejected")}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {!claims.length ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-sm text-muted-foreground">No vendor claims found.</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
