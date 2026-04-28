"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { safeApiRequest } from "@/lib/client-api";

interface AlertItem {
  id: string;
  toolId: string | null;
  type: "price_change" | "new_alternative" | "score_drop";
  thresholdPercent: number | null;
  active: boolean;
}

interface AlertsManagerProps {
  enabled: boolean;
}

function isAlertItem(value: unknown): value is AlertItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AlertItem>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.active === "boolean" &&
    (candidate.toolId === null || typeof candidate.toolId === "string") &&
    (candidate.thresholdPercent === null || typeof candidate.thresholdPercent === "number")
  );
}

function extractAlerts(payload: unknown): AlertItem[] {
  const root = payload as { data?: unknown } | null;
  const maybeNested = root?.data as { data?: unknown } | undefined;
  const candidate = Array.isArray(maybeNested?.data) ? maybeNested.data : root?.data;

  if (!Array.isArray(candidate)) {
    return [];
  }

  return candidate.filter(isAlertItem);
}

function extractAlert(payload: unknown): AlertItem | null {
  const root = payload as { data?: unknown } | null;
  const maybeNested = root?.data as { data?: unknown } | undefined;
  const candidate = maybeNested?.data ?? root?.data;

  return isAlertItem(candidate) ? candidate : null;
}

export function AlertsManager({ enabled }: AlertsManagerProps) {
  const [toolSlug, setToolSlug] = useState("");
  const [type, setType] = useState<AlertItem["type"]>("new_alternative");
  const [thresholdPercent, setThresholdPercent] = useState("");
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAlerts() {
    if (!enabled) {
      return;
    }

    try {
      setLoading(true);
      const result = await safeApiRequest<unknown>("/api/alerts");

      if (!result.ok) {
        throw new Error(result.error ?? "Could not load alerts.");
      }

      setAlerts(extractAlerts(result.data));
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not load alerts.";
      setMessage(detail);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAlerts();
  }, [enabled]);

  async function createAlert() {
    try {
      setLoading(true);
      setMessage(null);
      const result = await safeApiRequest<unknown>("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          toolSlug: toolSlug.trim() || null,
          type,
          thresholdPercent: thresholdPercent ? Number(thresholdPercent) : null
        })
      });

      const createdAlert = extractAlert(result.data);

      if (!result.ok || !createdAlert) {
        throw new Error(result.error ?? "Could not create alert.");
      }

      setAlerts((prev) => [createdAlert, ...prev]);
      setToolSlug("");
      setThresholdPercent("");
      setMessage("Alert created.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not create alert.";
      setMessage(detail);
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) {
    return (
      <div className="rounded-[1rem] border border-dashed border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
        Alerts are available on Pro and Vendor plans.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Input
          value={toolSlug}
          onChange={(event) => setToolSlug(event.target.value)}
          placeholder="Tool slug (optional)"
        />
        <select
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
          value={type}
          onChange={(event) => setType(event.target.value as AlertItem["type"])}
        >
          <option value="new_alternative">New alternative</option>
          <option value="price_change">Price change</option>
          <option value="score_drop">Score drop</option>
        </select>
        <Input
          value={thresholdPercent}
          onChange={(event) => setThresholdPercent(event.target.value)}
          placeholder="Threshold % (optional)"
        />
      </div>
      <Button disabled={loading} onClick={() => void createAlert()}>
        {loading ? "Saving..." : "Create alert"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-[1rem] border border-border/70 bg-white/60 px-4 py-3 text-sm">
            <span className="font-medium">{alert.type.replaceAll("_", " ")}</span>
            {alert.thresholdPercent ? ` | threshold ${alert.thresholdPercent}%` : ""}
            {alert.toolId ? " | tool-specific" : " | global"}
          </div>
        ))}
        {!alerts.length && !loading ? (
          <p className="text-sm text-muted-foreground">No alerts yet. Create your first alert above.</p>
        ) : null}
      </div>
    </div>
  );
}
