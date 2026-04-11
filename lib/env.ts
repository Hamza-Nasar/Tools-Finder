import { z } from "zod";

function normalizeEnvValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const optionalString = z.preprocess(normalizeEnvValue, z.string().min(1).optional());
const optionalUrl = z.preprocess(normalizeEnvValue, z.string().url().optional());
const optionalBoolean = z.preprocess((value) => {
  const normalizedValue = normalizeEnvValue(value);

  if (typeof normalizedValue !== "string") {
    return normalizedValue;
  }

  return ["1", "true", "yes", "on"].includes(normalizedValue.toLowerCase());
}, z.boolean().optional());

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrl,
  MONGODB_URI: optionalString,
  MONGODB_DB_NAME: optionalString,
  NEXTAUTH_URL: optionalUrl,
  NEXTAUTH_SECRET: optionalString,
  ADMIN_EMAIL: z.preprocess(normalizeEnvValue, z.string().email().optional()),
  ADMIN_EMAILS: optionalString,
  ADMIN_PASSWORD_HASH: optionalString,
  ADMIN_SETUP_TOKEN: optionalString,
  ADMIN_SETUP_RECOVERY_ENABLED: optionalBoolean,
  GITHUB_ID: optionalString,
  GITHUB_SECRET: optionalString,
  GITHUB_DISCOVERY_TOKEN: optionalString,
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  GOOGLE_SITE_VERIFICATION: optionalString,
  AUTH_HTTP_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  PRODUCT_HUNT_BEARER_TOKEN: optionalString,
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
  STRIPE_FEATURED_LISTING_PRICE_CENTS: z.coerce.number().int().positive().optional(),
  STRIPE_FEATURED_LISTING_DURATION_DAYS: z.coerce.number().int().positive().optional(),
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: optionalString,
  ADMIN_NOTIFICATION_EMAIL: z.preprocess(normalizeEnvValue, z.string().email().optional())
});

export const env = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  ADMIN_SETUP_TOKEN: process.env.ADMIN_SETUP_TOKEN,
  ADMIN_SETUP_RECOVERY_ENABLED: process.env.ADMIN_SETUP_RECOVERY_ENABLED,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  GITHUB_DISCOVERY_TOKEN: process.env.GITHUB_DISCOVERY_TOKEN,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
  AUTH_HTTP_TIMEOUT_MS: process.env.AUTH_HTTP_TIMEOUT_MS,
  PRODUCT_HUNT_BEARER_TOKEN: process.env.PRODUCT_HUNT_BEARER_TOKEN,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_FEATURED_LISTING_PRICE_CENTS: process.env.STRIPE_FEATURED_LISTING_PRICE_CENTS,
  STRIPE_FEATURED_LISTING_DURATION_DAYS: process.env.STRIPE_FEATURED_LISTING_DURATION_DAYS,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL
});
