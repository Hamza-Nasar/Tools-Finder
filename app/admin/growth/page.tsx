import { GrowthService } from "@/lib/services/growth-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminGrowthPage() {
  const snapshot = await GrowthService.getKpiSnapshot();
  const cards = [
    { label: "Total users", value: snapshot.users },
    { label: "Paid users", value: snapshot.paidUsers },
    { label: "Vendor users", value: snapshot.vendorUsers },
    { label: "Vendor leads", value: snapshot.leads },
    { label: "Vendor claims", value: snapshot.claims },
    { label: "Paid records", value: snapshot.paidRecords },
    { label: "Paid conversion", value: `${snapshot.paidConversionRate}%` },
    { label: "Tools searches (14d)", value: snapshot.telemetry.toolsSearches },
    { label: "Finder searches (14d)", value: snapshot.telemetry.finderSearches },
    { label: "Compare views (14d)", value: snapshot.telemetry.compareViews },
    { label: "CTA clicks (14d)", value: snapshot.telemetry.ctaClicks }
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">Growth KPIs</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Weekly KPI baseline for paid conversion, vendor demand, and monetization trends.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-[family-name:var(--font-heading)] text-4xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
