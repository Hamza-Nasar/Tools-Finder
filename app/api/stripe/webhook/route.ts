import { handleApiError, ok } from "@/lib/api";
import { PaymentService } from "@/lib/services/payment-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    const body = await request.text();
    await PaymentService.handleStripeWebhook(body, signature);

    return ok({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
