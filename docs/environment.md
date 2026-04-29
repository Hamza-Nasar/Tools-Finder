# Environment Variables

## Core app

- `NEXT_PUBLIC_APP_URL`
  Public base URL for metadata, canonical URLs, Stripe redirects, sitemap entries, and email links.
- `NEXTAUTH_URL`
  NextAuth callback URL. Match the deployment domain.
- `NEXTAUTH_SECRET`
  Long random secret used for session encryption.
- `FF_COMPARE_PREVIEW` (optional)
  Feature flag to enable compare preview block on `/tools`. Default: `true`.
- `FF_FINDER_TELEMETRY` (optional)
  Feature flag to record finder search events. Default: `true`.
- `FF_TOOLS_SEARCH_TELEMETRY` (optional)
  Feature flag to record tools search events. Default: `true`.
- `FF_ADMIN_AUTO_REFRESH` (optional)
  Feature flag to enable periodic admin auto-refresh. Default: `true`.

## Database

- `MONGODB_URI`
  MongoDB Atlas or local connection string.
- `MONGODB_DB_NAME`
  Database name used by the app.

## Admin bootstrap

- `ADMIN_EMAIL`
  Bootstrap admin email for credentials login.
- `ADMIN_PASSWORD_HASH`
  Bcrypt hash for the bootstrap admin password.

## OAuth providers

- `GITHUB_ID`
- `GITHUB_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

These are optional. Leave blank if you only want credentials auth for the admin bootstrap flow.

## Stripe

- `STRIPE_SECRET_KEY`
  Secret API key used for checkout and webhook verification.
- `STRIPE_WEBHOOK_SECRET`
  Webhook signing secret from Stripe.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  Publishable key for any future client-side Stripe expansion.
- `STRIPE_FEATURED_LISTING_PRICE_CENTS`
  Featured listing price in cents.
- `STRIPE_FEATURED_LISTING_DURATION_DAYS`
  Number of days a paid featured listing stays active.
- `STRIPE_PRO_MONTHLY_PRICE_ID` (optional)
  If provided, checkout uses this existing Stripe Price for Pro monthly.
- `STRIPE_PRO_YEARLY_PRICE_ID` (optional)
  If provided, checkout uses this existing Stripe Price for Pro yearly.
- `STRIPE_VENDOR_MONTHLY_PRICE_ID` (optional)
  If provided, checkout uses this existing Stripe Price for Vendor monthly.
- `STRIPE_VENDOR_YEARLY_PRICE_ID` (optional)
  If provided, checkout uses this existing Stripe Price for Vendor yearly.

If these optional plan price IDs are not set, the app auto-creates subscription line items at checkout using in-code default pricing.

## Email

- `RESEND_API_KEY`
  API key for the email provider endpoint used in `EmailService`.
- `EMAIL_FROM`
  From header for transactional emails.
- `ADMIN_NOTIFICATION_EMAIL`
  Admin inbox for submission notifications. Falls back to `ADMIN_EMAIL`.
