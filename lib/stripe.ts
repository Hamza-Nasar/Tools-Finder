import Stripe from "stripe";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

export function requireStripe() {
  if (!stripe) {
    throw new AppError(503, "Stripe is not configured.", "STRIPE_NOT_CONFIGURED");
  }

  return stripe;
}
