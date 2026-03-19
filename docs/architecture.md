# AI Tools Finder Architecture

## Product scope

AI Tools Finder is designed as a global directory for discovering AI tools, filtering the catalog, reading detailed profiles, submitting new tools, saving favorites, and promoting featured listings. The initial architecture is optimized for SEO, modularity, and migration from mock data to MongoDB without rewriting the route tree.

## Core architecture decisions

### Frontend

- `Next.js App Router` for server-rendered marketing and SEO pages
- `React Server Components` for directory, category, and detail pages
- `Client components` only where interactivity is required: search filters, submission form, auth
- `Tailwind CSS` with a Shadcn-compatible component layer for design consistency

### Backend

- `Route handlers` under `app/api/*` for REST endpoints in MVP
- Shared domain logic in `lib/*` to prevent route-level duplication
- Validation centralized in `lib/validators/*`
- Rate limiting and auth checks applied at the edge and route layers

### Data layer

- `MongoDB Atlas` as the production database target
- `Mongoose` schemas in `models/*`
- `lib/mongodb.ts` handles cached connections for serverless execution
- `lib/services/*` owns the database-backed business logic
- `lib/data/*` provides cached public reads and request-scoped authenticated reads

### Authentication

- `NextAuth` with credentials-based admin bootstrap
- OAuth providers are scaffolded for later user sign-in expansion
- `middleware.ts` reserves `admin` and `favorites` routes for authenticated sessions

### Payments

- `lib/stripe.ts` provides a single Stripe client
- Featured placement will be handled by dedicated checkout and webhook routes in Phase 7

## Route map

### Public pages

- `/`
- `/tools`
- `/tools/[slug]`
- `/categories`
- `/categories/[slug]`
- `/submit`
- `/favorites`

### Admin pages

- `/admin`
- `/admin/tools`
- `/admin/categories`
- `/admin/users`
- `/admin/submissions`

### Auth pages

- `/auth/sign-in`
- `/auth/error`

### API routes

- `/api/auth/[...nextauth]`
- `/api/tools`
- `/api/tools/[slug]`
- `/api/categories`
- `/api/submissions`
- `/api/favorites`
- `/api/admin/tools`
- `/api/admin/categories`
- `/api/admin/users`

## Module boundaries

### `app/`

Owns route composition, metadata, and server component entry points.

### `components/`

Owns reusable presentation and client interaction building blocks:

- `layout/` for shells and navigation
- `marketing/` for homepage sections
- `tools/` for directory and detail UI
- `forms/` for submissions and admin inputs
- `ui/` for base primitives

### `lib/`

Owns cross-cutting concerns:

- config and environment parsing
- SEO helpers
- database connection
- auth options
- Stripe client
- cached read helpers and service utilities
- validation and rate limiting

### `models/`

Owns Mongoose schemas and entity persistence definitions.

### `types/`

Owns shared TypeScript contracts between UI and API layers.

### `utils/`

Owns focused helper utilities with narrow responsibilities such as slug generation.

## Data flow

1. Route entry points read query params and call cached data helpers or services.
2. Services execute validated database reads and writes through Mongoose models.
3. API routes validate payloads and enforce session or rate-limit checks.
4. Server actions handle high-value write paths such as submissions and cache revalidation.

## SEO strategy

- Static and dynamic metadata via `generateMetadata`
- Structured data ready to be injected on detail pages
- Sitemap and robots generation under `app/`
- Slug-based URLs for all category and tool detail routes

## Scaling strategy

- Move tool listing queries behind a service layer with caching
- Add Redis-backed rate limiting and response caching
- Introduce background jobs for ingestion, moderation, and analytics
- Split admin APIs or payments into isolated services only if traffic justifies it

## Recommended next implementation order

1. Add dedicated admin forms for create, update, approve, reject, and feature workflows
2. Add media upload storage for logos and screenshots
3. Expand favorites, reviews, and analytics aggregation
4. Implement Stripe checkout and webhook flow for featured listings
5. Split sitemap generation and background jobs once catalog size materially grows
