"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { safeApiRequest } from "@/lib/client-api";

interface VendorLeadRecord {
  id: string;
  toolId: string;
  sourcePath: string;
  contactName: string;
  contactEmail: string;
  useCase: string;
  budget: "unknown" | "under_50" | "50_200" | "200_plus";
  status: "new" | "contacted" | "qualified" | "closed";
  createdAt: string | null;
}

export function VendorLeadsConsole({ leads }: { leads: VendorLeadRecord[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function updateStatus(leadId: string, status: VendorLeadRecord["status"]) {
    try {
      setPendingId(leadId);
      const result = await safeApiRequest("/api/admin/vendor/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          leadId,
          status
        })
      });

      if (!result.ok) {
        throw new Error(result.error ?? "Lead update failed.");
      }

      router.refresh();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Lead update failed.";
      window.alert(detail);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-5">
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardHeader className="border-b border-border/70">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>{lead.contactName}</CardTitle>
                <CardDescription>
                  {lead.contactEmail} | Tool ID: {lead.toolId}
                </CardDescription>
              </div>
              <Badge>{lead.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">{lead.useCase}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>Budget: {lead.budget}</span>
              <span>Source: {lead.sourcePath}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["new", "contacted", "qualified", "closed"] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={lead.status === status ? "default" : "outline"}
                  disabled={pendingId === lead.id}
                  onClick={() => void updateStatus(lead.id, status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {!leads.length ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-sm text-muted-foreground">No vendor leads captured yet.</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
