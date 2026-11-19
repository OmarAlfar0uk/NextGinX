<div align="center">
  <img src="https://raw.githubusercontent.com/OmarAlfar0uk/NextGinX/2ec3fd0d7fb41738f541abd860eefdea8d057643/public/NextGinX_Logo.png" width="380" alt="NextGinX — Build. Launch. Scale." />
  <h1>NextGinX</h1>
  <p><code>digital products / made practical</code></p>
  <p><code>BUILD</code> · <code>LAUNCH</code> · <code>SCALE</code></p>
</div>

```text
┌─ nextginx / project status ──────────────────────────────────┐
│  product   bilingual corporate website (English + Arabic)    │
│  backend   PostgreSQL lead capture + focused admin workspace │
│  editor    homepage headline and supporting text only        │
│  boundary  not a full CMS or a production-ready platform     │
└──────────────────────────────────────────────────────────────┘
```

> **In one line:** NextGinX pairs a bilingual company site with a working enquiry-to-lead workflow. The admin area handles lead operations and a small homepage editor; most public content is still maintained in source files.

**Navigate:** [Overview](#01--system-map) · [Scope](#02--scope-boundaries) · [Quick start](#03--quick-start) · [Admin](#04--admin-access) · [Email worker](#05--contact-email-outbox) · [Commands](#06--command-reference) · [Environment](#07--environment) · [Audit](#08--dependency-audit-snapshot) · [Production](#09--before-production)

---

## 01 / System map

```text
VISITOR
  ├─ /en  ─┐
  └─ /ar  ─┴─> localized pages (Arabic uses RTL layout)
                 └─ contact form
                      └─ PostgreSQL: Lead + creation event + email-outbox record
                           └─ optional worker run ─> Resend
```

The public site includes Home, About, Services and service details, Industries, Work and project details, Process, Insights, Contact, Privacy, and Terms. `/` redirects to `/en`.

The lead workspace supports search, status and assignee filters, pagination, lead editing, assignment, status changes, internal notes, activity history, and CSV export. Sales Agents are limited to leads assigned to them.

A successful contact-form response means the enquiry was **saved to the database**. It does not mean an email was sent; delivery is a separate, optional worker step.

## 02 / Scope boundaries

- **The homepage editor is deliberately small.** It saves and publishes only the headline and supporting text, separately for English and Arabic. Unpublished drafts do not appear on the public homepage.
- **Most website copy is source-managed.** Services, industries, projects, process, About content, navigation, and most other public text live in files under `src/data` and `src/lib/i18n.ts`.
- **Portfolio entries are concepts.** The displayed work is internal demonstration material—not client deployments, endorsements, or verified business results. Industry examples describe possible work rather than a record of prior clients.
- **Insights is empty for now.** There are no published articles. Privacy and Terms are content placeholders that NextGinX must complete and review before launch; they are not legal advice.
- **A broader CMS is not implemented.** The schema includes content, permissions, media, and password-reset models, but full CMS editing, admin-user management, password-reset delivery, media upload/storage, and comprehensive audit coverage are not available in this snapshot. Neither analytics charts nor a browser end-to-end test suite are included.
- **Rate limits are process-local.** Contact submissions (5 per hour) and failed logins (8 per 15-minute window) are limited in memory. Limits are not shared across server instances and reset when a process restarts; production needs a shared rate-limiting service.
- **Storage variables are placeholders.** S3-compatible settings appear in `.env.example`, but there is no active admin upload flow.

## 03 / Quick start

### Requirements

- Node.js **20.9+** and npm
- PostgreSQL **16**, installed locally or run with Docker Compose

PostgreSQL is needed at runtime for the localized homepage, admin features, and lead persistence. The homepage reads a published hero override from the database and falls back to source copy when no override exists.

### Install and configure

```bash
git clone https://github.com/OmarAlfar0uk/NextGinX.git
cd NextGinX
npm ci
cp .env.example .env
```

Set `DATABASE_URL` in `.env` to the PostgreSQL database you intend to use. To start the local Compose database with the example defaults:

```bash
docker compose up -d postgres
```

Compose reads the root `.env` file. Its PostgreSQL service binds to `127.0.0.1` and the included credentials are for local development only—do not expose the service publicly or reuse those credentials in production. If you change the Compose database, user, password, or port in `.env`, keep `DATABASE_URL` in sync.

Generate Prisma Client, inspect migration status, and apply the committed migrations:

```bash
npm run db:generate
npm run db:status
npm run db:deploy
```

The committed migrations are `20261030000000_init` and `20261030010000_outbox_worker_leases`. Review migration status and SQL before applying changes to any database. `db:deploy` applies pending committed migrations; never run `prisma migrate reset` against a database containing data.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/ar`. The admin sign-in page is `http://localhost:3000/admin/login`.

### Create the first Super Admin

After migrations succeed, bootstrap the first admin. Supply a name and email, then either set a password of at least 14 characters or let the script generate one. Prefer process environment variables and keep credentials out of source control.

```bash
export BOOTSTRAP_ADMIN_NAME="Site Owner"
export BOOTSTRAP_ADMIN_EMAIL="owner@example.com"
export BOOTSTRAP_GENERATE_PASSWORD=1
npm run admin:bootstrap
unset BOOTSTRAP_ADMIN_NAME BOOTSTRAP_ADMIN_EMAIL BOOTSTRAP_GENERATE_PASSWORD
```

The generated password is printed once; store it securely. Passwords are hashed with Argon2id. Bootstrap stops if a Super Admin already exists or the supplied email is already in use.

## 04 / Admin access

Server-side checks protect admin pages and APIs. The roles are `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `SALES_MANAGER`, and `SALES_AGENT`.

| Role | Implemented access |
| --- | --- |
| `EDITOR` | Save and publish the supported homepage text. |
| `SALES_MANAGER` | View, edit, assign, and export leads. |
| `SALES_AGENT` | Work with assigned leads: change status, add internal notes, and export only leads they can access. |
| `ADMIN` / `SUPER_ADMIN` | Have broader grants in the permission model; admin-user management screens and APIs are not included in this snapshot. |

**Session model:** Admin sessions use random tokens in `HttpOnly`, `SameSite=Strict` cookies. PostgreSQL stores only SHA-256 token hashes. Sessions expire after eight hours and are rejected if expired, revoked, or tied to an inactive account. Cookies are marked `Secure` in production. Password-reset delivery is not implemented.

## 05 / Contact email & outbox

A contact enquiry can be saved even when email delivery is not configured. If `CONTACT_TO_EMAIL` is blank, the lead and its creation event are still saved, while the outbox records a configuration failure. The form's success response therefore confirms **database capture, not email delivery**.

To enable notifications, configure `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, and the server-only `RESEND_API_KEY`, then run:

```bash
npm run mail:outbox
```

Each worker run processes up to 25 due records. It claims jobs through database updates, recovers stale leases, retries up to five times with exponential backoff, and sends a Resend idempotency key. No scheduler is bundled; use an external scheduler for recurring processing. Delivery and retries have not been verified against Resend in this repository environment because provider credentials are not configured.

## 06 / Command reference

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve a production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript checks. |
| `npm run db:generate` | Generate Prisma Client. |
| `npm run db:status` | Show migration status. |
| `npm run db:verify` | Check database connectivity, migration state, and basic record counts without changing data. |
| `npm run db:migrate` | Create/apply migrations during local schema development (`prisma migrate dev`). |
| `npm run db:deploy` | Apply pending committed migrations. |
| `npm run admin:bootstrap` | Create the first Super Admin account. |
| `npm run mail:outbox` | Process due email-outbox records. |
| `npm run test:integration` | Run PostgreSQL and optional HTTP integration tests. |
| `npm run test:auth` | Run the admin authentication smoke test. |

### Test database safety

Use a disposable development/test database for both test commands—never production data.

`npm run test:integration` skips database tests when `DATABASE_URL` is not set. Its HTTP/API checks also need a running app and `APP_BASE_URL` pointing to it. Fixtures use unique records and clean up their test data; the HTTP test also exercises homepage publishing and restores any prior homepage entries.

`npm run test:auth` needs a bootstrapped Super Admin and its password, supplied through a protected process environment variable or a no-echo terminal prompt. It temporarily deactivates and then reactivates that account while testing inactive-account behavior, and creates test sessions plus a temporary editor account. Do not run it against a production database.

## 07 / Environment

`.env.example` lists the site URL, database and local Compose settings, public contact/social links, Resend settings, and S3 placeholders. Keep secrets server-side; never expose them through `NEXT_PUBLIC_*` variables.

| Variable(s) | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public site origin used for canonical metadata and sitemap generation; may be blank in local development. |
| `DATABASE_URL` | PostgreSQL connection string; required at runtime for the homepage, admin features, and lead persistence. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT` | Optional local Docker Compose settings; the example credentials are development-only. |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL` | Public contact/social links. These intentionally default to blank until approved values are supplied. |
| `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `RESEND_API_KEY` | Server-side notification recipient, sender, and Resend API key. All must be configured for delivery. |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL` | Reserved for S3-compatible media support; uploads are not implemented. |
| `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_GENERATE_PASSWORD` | One-time bootstrap inputs. Supply through the local process environment; these are not listed in `.env.example`. |
| `APP_BASE_URL`, `BOOTSTRAP_TEST_PASSWORD`, `TEST_SECURE_COOKIES` | Optional test configuration: HTTP integration-test app URL, non-interactive auth-test password, and production-style cookie check. |


## 08 / Dependency audit snapshot

A registry-backed `npm audit --package-lock-only` run on **2026-11-19** reported **9 advisories: 3 high, 6 moderate, 0 critical**. The three high entries are the same `deepmerge-ts@7.1.5` advisory ([GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx)), reached through the Prisma 6.19.3 CLI/config dependency path. npm proposes Prisma 7.10.1, a major upgrade; that upgrade and an unverified transitive override have not been applied. The affected path is in Prisma developer/config tooling, not a visitor-facing application feature.

The six moderate entries are in the ESLint/TypeScript ESLint development toolchain, including the transitive `minimatch` advisory ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)); npm reported fixes available for those paths. The lockfile resolves the PostCSS override to `8.5.32` and `sharp` to `0.35.5`; this audit reported no remaining findings for those packages. Re-run `npm audit` in CI because advisory data and available fixes change over time.


## 09 / Before production

This repository should not be treated as production-complete. Before launch, configure an HTTPS origin and production secrets; managed PostgreSQL backups and restore drills; a verified Resend sender and recipient; an external schedule for outbox processing; and shared rate limiting. Review deployment security headers and operational logging, and complete the legal pages. Add storage configuration only when an upload feature is implemented. No production performance score or Lighthouse measurement is recorded in this repository.
