import { VendorService } from "@/lib/services/vendor-service";
import { VendorClaimsConsole } from "@/components/admin/vendor-claims-console";

export const dynamic = "force-dynamic";

export default async function AdminVendorClaimsPage() {
  const claims = await VendorService.listClaims({ page: 1, limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin</p>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-bold">Vendor claims</h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Review incoming claim requests and approve or reject ownership access.
        </p>
      </div>
      <VendorClaimsConsole claims={claims.data} />
    </div>
  );
}
