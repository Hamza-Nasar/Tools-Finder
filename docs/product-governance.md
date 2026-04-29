# Product Governance

## Listing quality rubric

Every tool listing must pass:

1. Clear task definition
- `tagline` explains concrete job-to-be-done
- no generic claims like "best AI ever"

2. Metadata completeness
- `pricing`, `category`, `tags`
- `loginRequired`, `skillLevel`, `platforms`, `outputTypes`
- `bestFor` entries (2-8 short items)

3. Trust and freshness
- `verifiedListing` only if reviewed by admin
- `lastCheckedAt` set when website and pricing are revalidated

4. Link hygiene
- `website` must resolve
- `affiliateUrl` optional but valid URL if present

## Content standards

1. Description length: 40-600 chars
2. Best-for item length: 2-80 chars
3. Tags: 1-12, no duplicates, no filler tags
4. No copy-paste duplicate descriptions across different tools

## Moderation states

1. `pending`
- default for new user submissions
- requires admin review

2. `approved`
- visible in public directory
- eligible for compare, finder, and recommendations

3. `rejected`
- hidden from public discovery
- optional moderation note required

4. `draft`
- internal staging content
- excluded from public lists

## Review cadence

1. High-traffic tools: every 30 days
2. Remaining approved tools: every 90 days
3. Re-check triggers:
- sudden pricing changes
- broken website
- high complaint rate from users

## Operational ownership

1. Admin team owns listing quality and verification flags
2. Engineering owns schema, validation, and anti-duplicate safeguards
3. Growth owner tracks KPI drift and conversion changes after UX updates

