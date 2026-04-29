# UI QA Checklist

## Global UX

1. Header navigation works on desktop and mobile
2. Footer links resolve (no duplicate-key warnings)
3. Primary CTA labels are action-specific
4. No broken layouts at common widths (360, 768, 1024, 1440)

## Discovery flow

1. `/tools` search updates URL and results
2. Filters apply correctly:
- pricing
- category
- tags
- loginRequired
- skillLevel
- platforms
- outputTypes
3. Reset filters clears all active chips
4. Compare preview link opens valid compare page

## Finder flow

1. `/find-ai-tool` query generates recommendations
2. Inference chips render (category/tag)
3. Empty state appears for weak or no-match queries

## Tool detail flow

1. `Visit website` CTA works
2. Save/favorite toggle works for authenticated user
3. Metadata panel shows login, skill, platforms, outputs when present
4. Related tools and alternatives links resolve

## Admin flow

1. `/admin` shows latest purchases
2. `/admin/tools` can edit metadata fields:
- loginRequired
- skillLevel
- platforms
- outputTypes
- bestFor
- verifiedListing
- lastCheckedAt
3. `/admin/growth` shows telemetry KPI cards
4. Admin auto-refresh works without navigation break

## Reliability checks

1. Console has no duplicate key warnings
2. Runtime errors do not break full page render
3. API failures show graceful fallback messages

## Release checks

1. `npm run typecheck` passes
2. `npm run build` passes
3. Key routes smoke tested:
- `/`
- `/tools`
- `/find-ai-tool`
- `/tools/[slug]`
- `/compare/[slug]`
- `/admin`

