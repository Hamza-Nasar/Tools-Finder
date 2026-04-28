import { VendorService } from "@/lib/services/vendor-service";
import { VendorLeadsConsole } from "@/components/admin/vendor-leads-console";

export const dynamic = "force-dynamic";

export default async function AdminVendorLeadsPage() {
  const leads = await VendorService.listLeads({ page: 1, limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">Vendor leads</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Track lead demand from tool pages and monitor qualification quality.
        </p>
      </div>
      <VendorLeadsConsole leads={leads.data} />
    </div>
  );
}
