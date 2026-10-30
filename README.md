# NextGinX

Bilingual Next.js corporate website with PostgreSQL-backed admin authentication, lead capture, and sales lead management. The public marketing pages still use source-managed content; the database CMS is not yet connected to those pages.

## Local development

Requirements: Node.js 20.9+, npm, and a local PostgreSQL 16 instance. Docker is optional and is not used for the native PostgreSQL workflow below.

1. Install dependencies with `npm install`.
2. Create a local `.env` (or `.env.local`) from `.env.example` and set `DATABASE_URL` to the PostgreSQL database you intend to use. Do not commit either local env file.
3. Check that PostgreSQL is listening and that the URL points at the intended database. Then run:

   ```bash
   npm run db:generate
   npm run db:status
   npm run db:deploy
   ```

`db:deploy` applies only committed, pending migrations. Review migration SQL and status before applying; never use `prisma migrate reset` on a database with data. Current migrations are `20261030000000_init` and the additive outbox lease migration `20261030010000_outbox_worker_leases`.

## First Super Admin

After migrations succeed, run `npm run admin:bootstrap`. The existing bootstrap script requires `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, and either a strong `BOOTSTRAP_ADMIN_PASSWORD` or `BOOTSTRAP_GENERATE_PASSWORD=1`. Supply them only in the local process environment. Generated credentials are printed once by the script; the database stores only an Argon2id password hash. The bootstrap refuses to create a duplicate Super Admin.

## Commands

```bash
npm run dev                # Next.js development server
npm run typecheck          # TypeScript
npm run lint               # ESLint
npm run build              # Production build
npm run db:generate        # Prisma Client
npm run db:status          # Applied/pending migration status
npm run db:verify          # Non-destructive connectivity and schema checks
npm run test:integration  # PostgreSQL fixtures; HTTP boundary test also needs APP_BASE_URL and a running app
npm run test:auth          # HTTP/database auth smoke test; provide password through secure prompt/env
npm run mail:outbox        # Process due outbox records when Resend is configured
```

Integration fixtures use unique records and delete only those fixtures. Do not point tests at production data. Keep `APP_BASE_URL` and all credentials in local process environment, not source control.

## Current backend behavior

- Admin sessions use random tokens in HttpOnly, SameSite=Strict cookies; only SHA-256 token hashes are persisted. Cookies are Secure in production, and expired, revoked, or inactive-account sessions are rejected.
- Server-side role checks protect dashboard and lead APIs. Sales Agents are scoped to their assigned leads and can add notes and update status; Sales Managers can list, assign, edit, and export leads.
- Contact submissions are validated and persisted with a creation event and an outbox record. If no recipient is configured the outbox records a safe configuration failure; lead creation still succeeds. Resend delivery requires server-side `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` configuration.
- The outbox worker claims jobs with database compare-and-set updates, stores a lease timestamp, recovers stale leases, and retries up to five times with exponential backoff and a Resend idempotency key. It can be scheduled with `npm run mail:outbox`. Delivery and retry behavior have not been exercised against Resend because provider credentials are not configured locally.
- Lead records and activity are database-backed. The admin UI includes overview, lead search/filter/pagination, lead details, assignment, status updates, notes, activity, and CSV export.
- The homepage hero has a bilingual English/Arabic draft and publish editor. Drafts are stored separately from the published row; public pages read only published rows, and publishing invalidates the locale page path.

## Incomplete platform areas

The rest of the CMS (pages, services, portfolio, articles, settings, and navigation), full user and permission management, password reset delivery, comprehensive audit-event coverage, media upload/storage, bilingual content editing beyond the homepage hero, analytics charts, and end-to-end browser suite are not complete. Most public English and Arabic website content remains source-managed. Do not treat the platform as production-complete until these are implemented and tested.

## Dependency audit (2026-10-30)

`npm audit` reports three high-severity dependency paths, all caused by the single `deepmerge-ts` advisory [GHSA-ggr8-5vv4-36mx / CVE-2026-40345](https://github.com/advisories/GHSA-ggr8-5vv4-36mx). The locked package is `deepmerge-ts@7.1.5`, reached through `prisma@6.19.3` → `@prisma/config@6.19.3`; upstream marks versions below 8.0.0 affected. npm proposes Prisma 7.10.1, a major upgrade. Prisma CLI is a development dependency and this code path handles config merging, so the production application does not pass visitor data into it; exposure is primarily developer/CI availability if untrusted cyclic objects are supplied to the merge API. The Prisma major upgrade or an unverified transitive major override was not applied.

The compatible PostCSS override (`^8.5.32`) is in `package.json` and the lockfile; `npm ls` confirms Next.js resolves to patched `postcss@8.5.32`. Next.js remains on 15.5.28; `sharp@0.35.5` is also at its advisory's fixed version. The last registry-backed audit reported no remaining PostCSS or sharp findings. Re-run `npm audit` in CI when the advisory database is available.

## Environment variables

See `.env.example` for the complete variable list. Server-only secrets include `DATABASE_URL`, bootstrap credentials, Resend credentials, and S3 credentials. Never expose them through `NEXT_PUBLIC_*` variables. Public contact/social links are intentionally blank until the company supplies approved values.

## Production notes

Before launch, configure an HTTPS origin, managed PostgreSQL backups and restore drills, production secrets, a verified Resend sender and recipient, shared rate limiting, scheduled outbox processing, storage credentials if media support is added, and deployment-specific security headers. Run database migrations with `npm run db:deploy` as a controlled release step. No production performance score or Lighthouse measurement is currently recorded.
