<div align="center">
  <table border="0" cellspacing="0" cellpadding="16">
    <tr>
      <td align="center" bgcolor="#0b0f1a">
        <img src="https://raw.githubusercontent.com/OmarAlfar0uk/NextGinX/2ec3fd0d7fb41738f541abd860eefdea8d057643/public/NextGinX_Logo.png" width="420" alt="NextGinX — Build. Launch. Scale." />
      </td>
    </tr>
  </table>

  <p><strong>Digital products, made practical.</strong><br />
  A bilingual corporate site with a real lead workflow and a deliberately focused admin workspace.</p>

  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&amp;weight=600&amp;size=22&amp;duration=2600&amp;pause=750&amp;color=35D0BA&amp;center=true&amp;vCenter=true&amp;width=720&amp;lines=Digital+products%2C+made+practical;One+site%2C+two+languages;From+enquiry+to+organized+lead" alt="Animated phrases: Digital products, made practical; One site, two languages; From enquiry to organized lead" />

  <br />
  <a href="#quick-start">Quick start</a> ·
  <a href="#what-you-can-do">What’s inside</a> ·
  <a href="#honest-scope">Honest scope</a> ·
  <a href="#commands">Commands</a>

  <br /><br />
  <img src="https://img.shields.io/badge/LOCALES-EN%20%2B%20AR-06b6d4?style=flat-square" alt="Languages: English and Arabic" />
  <img src="https://img.shields.io/badge/NEXT.JS-APP%20ROUTER-111827?style=flat-square&amp;logo=next.js" alt="Next.js App Router" />
  <img src="https://img.shields.io/badge/PRISMA-POSTGRESQL-4c51bf?style=flat-square&amp;logo=prisma" alt="Prisma and PostgreSQL" />
</div>

---

> **The short version:** NextGinX is a bilingual English/Arabic company website with a PostgreSQL-backed contact-to-lead pipeline and a small admin area. It is **not** a full CMS, a verified client portfolio, or a production-ready platform.

## 01 / What you can do

| Public experience | Lead operations |
| --- | --- |
| Explore Home, About, Services and service details, Industries, Work and project details, Process, Insights, Contact, Privacy, and Terms in English or Arabic. Arabic pages use right-to-left layout. | Capture validated enquiries as leads, keep a creation event and email-outbox record, then search, filter, paginate, assign, update, annotate, review activity, and export leads from the admin area. |
| Visit `/` and get redirected to `/en`. | Save and publish the homepage headline and supporting text separately for English and Arabic. Unpublished drafts stay out of the public homepage. |

### The enquiry path

```text
Visitor → /en or /ar → Contact form → Lead + event + outbox → Optional worker → Resend
```

Email is a separate, optional delivery step: a successful form response confirms that the enquiry was saved, **not** that an email was delivered.

## 02 / Honest scope

- The homepage editor changes **only the headline and supporting text**. Services, industries, projects, process, About copy, navigation, and most other public content remain in source files under `src/data` and `src/lib/i18n.ts`.
- Portfolio entries are internal concept demonstrations—not client deployments, endorsements, or verified business results. Industry examples describe possible work, not a record of previous clients.
- Insights has no published articles yet. Privacy and Terms are placeholders that NextGinX must complete and review before launch; they are not legal advice.
- The database schema contains broader CMS, permissions, media, and password-reset models. Full CMS editing, admin-user management, password-reset delivery, media upload/storage, comprehensive audit coverage, analytics charts, and browser end-to-end tests are **not implemented** in this snapshot.
- Contact-submission and failed-login rate limits live in process memory. They are not shared across server instances and reset when a process restarts; production deployments need shared rate limiting.
- The S3-compatible environment variables are placeholders for future media support. There is no active admin upload flow in this snapshot.

## 03 / Quick start

### You’ll need

- Node.js **20.9+** and npm
- PostgreSQL **16** (local install or Docker Compose)

PostgreSQL is required at runtime for the localized homepage, admin features, and contact submissions. The homepage reads its published hero override from the database and falls back to source copy when no override exists.

### Get it running

```bash
git clone https://github.com/OmarAlfar0uk/NextGinX.git
cd NextGinX
npm ci
cp .env.example .env.local
```

Set `DATABASE_URL` in `.env.local` to the PostgreSQL database you intend to use. For a local database using the example defaults, start the Compose service:

```bash
docker compose up -d postgres
```

The Compose service binds to `127.0.0.1` and uses development-only default credentials. Do not expose it publicly or reuse those credentials in production. If you change the Compose credentials or port, keep `DATABASE_URL` in sync.

Generate Prisma Client, check migration status, and apply the committed migrations:

```bash
npm run db:generate
npm run db:status
npm run db:deploy
```

The current migrations are `20261030000000_init` and `20261030010000_outbox_worker_leases`. Review migration status and SQL before applying changes to a database. `db:deploy` applies pending committed migrations; never use `prisma migrate reset` on a database containing data.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/ar`. The admin sign-in page is at `http://localhost:3000/admin/login`.

### Create the first Super Admin

After the database migrations succeed, bootstrap the first admin account. Supply a name and email, then either provide a password of at least 14 characters or have the script generate one. Prefer process environment variables; keep credentials out of source control.

```bash
export BOOTSTRAP_ADMIN_NAME="Site Owner"
export BOOTSTRAP_ADMIN_EMAIL="owner@example.com"
export BOOTSTRAP_GENERATE_PASSWORD=1
npm run admin:bootstrap
unset BOOTSTRAP_ADMIN_NAME BOOTSTRAP_ADMIN_EMAIL BOOTSTRAP_GENERATE_PASSWORD
```

The generated password is printed once; store it securely. Passwords are hashed with Argon2id. Bootstrap refuses to run if a Super Admin already exists or the supplied email is already in use.

## 04 / Admin access model

Server-side checks enforce roles for admin pages and APIs. The roles are `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `SALES_MANAGER`, and `SALES_AGENT`.

| Role | Implemented access |
| --- | --- |
| `EDITOR` | Save and publish the supported homepage text. |
| `SALES_MANAGER` | View, edit, assign, and export leads. |
| `SALES_AGENT` | Work with assigned leads: update status, add internal notes, and export only leads they can see. |
| `ADMIN` / `SUPER_ADMIN` | Broader grants in the permission model. Admin-user management screens and APIs are not part of this snapshot. |

**Session details:** Admin sessions use random tokens in `HttpOnly`, `SameSite=Strict` cookies. PostgreSQL stores only SHA-256 token hashes. Sessions expire after eight hours and are rejected if expired, revoked, or tied to an inactive account. Cookies are marked `Secure` in production. Password-reset delivery is not implemented.

## 05 / Contact email and the outbox

Contact submissions can be saved even when email delivery is not configured. If `CONTACT_TO_EMAIL` is empty, the lead and its creation event are still saved while the outbox records a configuration failure. The form’s success response therefore means **database capture**, not successful email delivery.

To send notifications, configure `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, and the server-only `RESEND_API_KEY`, then run the worker:

```bash
npm run mail:outbox
```

Each run processes up to 25 due records. The worker claims jobs through database updates, recovers stale leases, retries up to five times with exponential backoff, and sends a Resend idempotency key. No scheduler is bundled; use an external scheduler if recurring processing is needed. Delivery and retry behavior have not been verified against Resend in this repository environment because provider credentials are not configured.

## 06 / Commands

| Command | What it does |
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

### Tests and database safety

Use a disposable development/test database for both test commands—never production data.

`npm run test:integration` skips database tests when `DATABASE_URL` is not set. Its HTTP/API checks also need a running application and `APP_BASE_URL` pointing to it. Fixtures use unique records and clean up their own test data; the HTTP test also exercises publishing and restores prior homepage entries.

`npm run test:auth` needs a bootstrapped Super Admin and its password, supplied through a protected process environment variable or a no-echo terminal prompt. It temporarily deactivates and then reactivates that account while checking inactive-account behavior, so do not run it against a production database. It also creates test sessions and a temporary editor account.

## 07 / Environment variables

`.env.example` lists the site URL, database and local Compose settings, public contact/social links, Resend settings, and S3 placeholders. Keep secrets server-side; do not expose them through `NEXT_PUBLIC_*` variables.

| Variable(s) | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public site origin used for canonical metadata and sitemap generation; may be blank in local development. |
| `DATABASE_URL` | PostgreSQL connection string. Required at runtime for the homepage, admin features, and lead persistence. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT` | Optional local Docker Compose settings; change the development-only defaults for your machine. |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_INSTAGRAM_URL` | Public contact/social links. These intentionally default to blank until approved values are supplied. |
| `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `RESEND_API_KEY` | Server-side lead-notification recipient, sender, and Resend API key. Recipient and sender must be configured for delivery. |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL` | Reserved for S3-compatible media support; uploads are not implemented yet. |
| `BOOTSTRAP_ADMIN_NAME`, `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_GENERATE_PASSWORD` | One-time bootstrap inputs. Set in the local process environment; these are not listed in `.env.example`. |
| `APP_BASE_URL`, `BOOTSTRAP_TEST_PASSWORD`, `TEST_SECURE_COOKIES` | Optional test configuration. `APP_BASE_URL` is used by HTTP integration tests; `BOOTSTRAP_TEST_PASSWORD` avoids the interactive prompt in the auth smoke test; `TEST_SECURE_COOKIES=1` checks production-style cookies. |

## 08 / Dependency audit snapshot

A registry-backed `npm audit --package-lock-only` run on **2026-11-19** reported **9 advisories: 3 high, 6 moderate, and 0 critical**. The three high entries are the same `deepmerge-ts@7.1.5` advisory ([GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx)), reached through the Prisma 6.19.3 CLI/config dependency path. npm proposes Prisma 7.10.1, a major upgrade; that upgrade and an unverified transitive override have not been applied. The affected path is in Prisma developer/config tooling, not a visitor-facing application feature.

The six moderate entries are in the ESLint/TypeScript ESLint development toolchain, including the transitive `minimatch` advisory ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)); npm reported fixes available for those paths. The lockfile resolves the PostCSS override to `8.5.32` and `sharp` to `0.35.5`; this audit reported no remaining findings for those packages. Re-run `npm audit` in CI because the advisory database and available fixes change over time.

## 09 / Before production

This repository should not be treated as production-complete. Before launch, configure an HTTPS origin and production secrets; managed PostgreSQL backups and restore drills; a verified Resend sender and recipient; an external schedule for outbox processing; and shared rate limiting. Review deployment security headers and operational logging, and complete the legal pages. Add storage configuration only when an upload feature is implemented. No production performance score or Lighthouse measurement is recorded in this repository.
