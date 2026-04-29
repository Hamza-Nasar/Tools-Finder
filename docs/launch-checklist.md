# Launch Readiness Checklist

## Product

- Create initial categories
- Seed initial approved tools
- Verify homepage sections are populated
- Review all empty states
- Validate decision metadata coverage (`loginRequired`, `skillLevel`, `platforms`, `outputTypes`, `bestFor`)
- Validate trust metadata (`verifiedListing`, `lastCheckedAt`)

## Monetization

- Confirm Stripe keys are live
- Confirm webhook delivery is successful
- Test featured purchase flow end to end
- Verify featured listings expire correctly

## Growth

- Verify `/best-ai-tools`
- Verify `/best-ai-tools-for-students`
- Verify `/best-ai-tools-for-developers`
- Verify `/best-free-ai-tools`
- Submit sitemap to Google Search Console
- Review telemetry baseline for `tools_search`, `finder_search`, and `compare_view`

## Operations

- Verify `/api/health`
- Verify admin login and admin route protection
- Verify MongoDB Atlas backups and alerts
- Verify Vercel production logs are accessible

## Messaging

- Confirm submission notification email
- Confirm approval notification email
- Confirm featured listing purchase email

## Final checks

- Run `npm run typecheck`
- Run `npm run build`
- Test mobile navigation
- Test category filters and search suggestions
- Test favorites
- Test affiliate redirect tracking
- Execute `docs/ui-qa-checklist.md`
