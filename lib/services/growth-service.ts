import { connectToDatabase } from "@/lib/mongodb";
import { TelemetryService } from "@/lib/services/telemetry-service";
import { PaymentRecordModel } from "@/models/PaymentRecord";
import { ToolClaimModel } from "@/models/ToolClaim";
import { UserModel } from "@/models/User";
import { VendorLeadModel } from "@/models/VendorLead";

export class GrowthService {
  static async getKpiSnapshot() {
    await connectToDatabase();
    const [users, paidUsers, vendorUsers, leads, claims, paidRecords, telemetry] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ plan: { $in: ["pro", "vendor"] } }),
      UserModel.countDocuments({ plan: "vendor" }),
      VendorLeadModel.countDocuments(),
      ToolClaimModel.countDocuments(),
      PaymentRecordModel.countDocuments({ status: "paid" }),
      TelemetryService.getEventKpis(14)
    ]);

    const paidConversionRate = users > 0 ? (paidUsers / users) * 100 : 0;

    return {
      users,
      paidUsers,
      vendorUsers,
      leads,
      claims,
      paidRecords,
      paidConversionRate: Number(paidConversionRate.toFixed(2)),
      telemetry
    };
  }
}
