# Stripe Integration Setup

## Purpose

Stripe powers paid featured listings.

## Required environment variables

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional for future client-side Stripe usage)
- `STRIPE_FEATURED_LISTING_PRICE_CENTS` (optional, defaults in code)
- `STRIPE_FEATURED_LISTING_DURATION_DAYS` (optional, defaults in code)

## Product model

This app creates checkout sessions dynamically from server code.

- Featured listings use server-side dynamic price data.
- Pro/Vendor subscriptions also work without pre-created Stripe price IDs.
- Optional plan price IDs can be set if you want Stripe-managed catalog prices:
  - `STRIPE_PRO_MONTHLY_PRICE_ID`
  - `STRIPE_PRO_YEARLY_PRICE_ID`
  - `STRIPE_VENDOR_MONTHLY_PRICE_ID`
  - `STRIPE_VENDOR_YEARLY_PRICE_ID`

## Configure webhooks

Listen for:

- `checkout.session.completed`
- `checkout.session.expired`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Webhook endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

## Local testing

Use the Stripe CLI and forward events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Checkout flow

1. User opens a tool detail page.
2. User clicks `Feature this tool`.
3. App creates a checkout session through `/api/stripe/checkout`.
4. Stripe redirects to `/feature/success` or `/feature/cancel`.
5. Webhook or success-page reconciliation activates the featured listing.
6. Expiration is enforced through featured listing lifecycle logic.

## Post-purchase behavior

- `PaymentRecord` is updated
- the tool becomes featured
- featured expiration is stored on the tool
- analytics and revenue dashboard update
- confirmation email is sent when email is configured
