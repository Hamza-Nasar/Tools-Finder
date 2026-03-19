# AI Tools Finder

AI Tools Finder is a production-ready SaaS directory for discovering, filtering, submitting, saving, and featuring AI tools. The platform is built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB, NextAuth, and Stripe.

## What is included

- Public directory with search, filters, pagination, categories, tool detail pages, favorites, and submission flow
- Admin console for tools, categories, submissions, users, analytics, revenue, and featured listing management
- Paid featured listings with Stripe checkout, success/cancel flows, webhook support, and expiration logic
- Affiliate redirect tracking through `/go/[slug]`
- Internal analytics for views, clicks, favorites, submissions, categories, trending, and revenue
- SEO system with metadata, canonical URLs, Open Graph, Twitter cards, structured data, sitemap, robots, and SEO landing pages
- Security hardening with validation, rate limiting, honeypot bot protection, protected admin routes, and response security headers

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Shadcn-style component structure
- MongoDB + Mongoose
- NextAuth
- Stripe
- Resend-compatible transactional email API

## Local development

1. Install dependencies:

```powershell
cmd /c npm install
```

2. Copy environment variables:

```powershell
Copy-Item .env.example .env.local
```

3. Fill in the required secrets in `.env.local`.

4. Start the app:

```powershell
cmd /c npm run dev
```

5. Verify production readiness:

```powershell
$env:NODE_OPTIONS='--max-old-space-size=4096'; cmd /c npm run typecheck
$env:NODE_OPTIONS='--max-old-space-size=4096'; cmd /c npm run build
```

## Atlas database setup

The app is configured to use MongoDB Atlas for both development and production while keeping the same database name:

- `MONGODB_URI` points to Atlas
- `MONGODB_DB_NAME=aitoolsfinder`
- `MIGRATION_SOURCE_MONGODB_URI=mongodb://127.0.0.1:27017/aitoolsfinder`

This keeps the live app on Atlas while still allowing you to pull data from the old local MongoDB database whenever you need to resync.

## Atlas migration and sync

Copy existing local development data into Atlas:

```powershell
cmd /c npm run migrate-atlas
```

Dry run without writes:

```powershell
cmd /c npm run migrate-atlas -- --dry-run
```

Verification only:

```powershell
cmd /c npm run migrate-atlas -- --verify-only
```

The migration:

- reads from `MIGRATION_SOURCE_MONGODB_URI`
- writes to `MONGODB_URI`
- uses `MONGODB_DB_NAME=aitoolsfinder` on both source and target
- preserves existing Atlas documents
- avoids duplicates with stable keys such as email, slug, website domain, session token, and relation signatures
- remaps linked ids so favorites, submissions, reviews, tool activity, and auth records stay attached to the right users and tools
- verifies tools, searchability, category coverage, and relational integrity after the sync

## Real tool import

Use the importer to pull real AI tools from public sources and insert them through the same submission and approval flow used by the application:

```powershell
cmd /c npm run import-tools
```

Preview candidates without writing to MongoDB:

```powershell
cmd /c npm run import-tools -- --dry-run
```

Target a larger catalog size:

```powershell
cmd /c npm run import-tools -- --target-total=300
```

Notes:

- The importer fetches from public AI tool sources such as Futurepedia public pages and curated GitHub AI tool lists.
- It deduplicates by normalized domain and slug before insert.
- It inserts through `SubmissionService.createSubmission()` and `SubmissionService.updateSubmission()` so sanitization, slug generation, and approval logic stay consistent with manual submissions.
- The command requires outbound network access to the source sites and a reachable `MONGODB_URI`.

## Core routes

- `/` homepage
- `/tools` directory
- `/tools/[slug]` tool details
- `/categories` category index
- `/submit` submission form
- `/favorites` authenticated favorites
- `/admin` analytics and operations dashboard
- `/go/[slug]` tracked outbound redirect
- `/api/health` deployment health endpoint

## Environment variables

Documented in [docs/environment.md](./docs/environment.md).

Critical variables:

- `NEXT_PUBLIC_APP_URL`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `MIGRATION_SOURCE_MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ADMIN_NOTIFICATION_EMAIL`

## Operational guides

- Database setup: [docs/database-setup.md](./docs/database-setup.md)
- Deployment: [docs/deployment.md](./docs/deployment.md)
- Stripe setup: [docs/stripe-setup.md](./docs/stripe-setup.md)
- SEO verification: [docs/seo-checklist.md](./docs/seo-checklist.md)
- Launch checklist: [docs/launch-checklist.md](./docs/launch-checklist.md)
- Architecture: [docs/architecture.md](./docs/architecture.md)

## Production notes

- MongoDB indexes are defined in the Mongoose models and will be created from the application layer.
- Use the same Atlas `MONGODB_DB_NAME` in development and production if you want one shared live dataset.
- Featured listing revenue is tracked in `PaymentRecord` and surfaced in the admin analytics dashboard.
- Search and homepage discovery are cached with `unstable_cache`.
- Tool pages remain server-rendered for SEO.
- Remote image optimization is enabled for external listing assets.

## Health checks

Use:

```text
GET /api/health
```

The route reports whether the app can currently reach MongoDB.
