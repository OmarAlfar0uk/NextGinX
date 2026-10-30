import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash, randomBytes } from "node:crypto";
import { PrismaClient, AdminRole, LeadStatus } from "@prisma/client";
import argon2 from "argon2";
import { loadLocalEnv } from "../../scripts/load-local-env.mjs";

loadLocalEnv();
const enabled = Boolean(process.env.DATABASE_URL);
const db = new PrismaClient();
let suffix, user, lead;
const fixtures = [];
const extraLeads = [];

before(async () => {
  if (!enabled) return;
  await db.$connect();
  suffix = randomUUID();
  user = await db.adminUser.create({ data: { name: "Integration Sales Agent", email: `integration-${suffix}@example.invalid`, passwordHash: "integration-only-not-a-password", role: AdminRole.SALES_AGENT } });
});
after(async () => {
  if (enabled && lead) await db.lead.deleteMany({ where: { id: lead.id } });
  if (enabled && extraLeads.length) await db.lead.deleteMany({ where: { id: { in: extraLeads } } });
  if (enabled && fixtures.length) await db.adminUser.deleteMany({ where: { id: { in: fixtures.map((fixture) => fixture.id) } } });
  if (enabled && user) await db.adminUser.deleteMany({ where: { id: user.id } });
  await db.$disconnect();
});

test("Postgres lead lifecycle persists activity, assignment, note and outbox; session tokens are only stored hashed", { skip: !enabled }, async () => {
  lead = await db.$transaction(async (tx) => {
    const created = await tx.lead.create({ data: { name: "Integration Lead", company: "Test Fixture", email: `lead-${suffix}@example.invalid`, service: "Custom software", description: "A database integration test fixture.", assigneeId: user.id } });
    await tx.leadEvent.create({ data: { leadId: created.id, actorId: user.id, action: "lead.created", metadata: { test: true } } });
    await tx.emailOutbox.create({ data: { leadId: created.id, recipient: "integration@example.invalid", subject: "Integration fixture", body: "Test only" } });
    return created;
  });
  assert.equal(await db.lead.count({ where: { id: lead.id } }), 1);
  assert.equal(await db.leadEvent.count({ where: { leadId: lead.id, action: "lead.created" } }), 1);
  assert.equal(await db.emailOutbox.count({ where: { leadId: lead.id, status: "PENDING" } }), 1);
  await db.leadNote.create({ data: { leadId: lead.id, authorId: user.id, body: "Integration note" } });
  await db.lead.update({ where: { id: lead.id }, data: { status: LeadStatus.CONTACTED } });
  await db.leadEvent.create({ data: { leadId: lead.id, actorId: user.id, action: "lead.status_changed", metadata: { from: "NEW", to: "CONTACTED" } } });
  const readback = await db.lead.findUniqueOrThrow({ where: { id: lead.id }, include: { notes: true, events: true, emailOutboxes: true } });
  assert.equal(readback.assigneeId, user.id); assert.equal(readback.status, LeadStatus.CONTACTED);
  assert.equal(readback.notes[0].body, "Integration note"); assert.ok(readback.events.length >= 2); assert.equal(readback.emailOutboxes.length, 1);
  const raw = randomBytes(32).toString("base64url"); const tokenHash = createHash("sha256").update(raw).digest("hex");
  const session = await db.adminSession.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60_000) } });
  const stored = await db.adminSession.findUniqueOrThrow({ where: { id: session.id } });
  assert.notEqual(stored.tokenHash, raw); assert.equal(stored.tokenHash, tokenHash);
  await db.adminSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
  assert.ok((await db.adminSession.findUniqueOrThrow({ where: { id: session.id } })).revokedAt);
});

test("admin lead APIs enforce authentication and sales role boundaries over HTTP", { skip: !enabled || !process.env.APP_BASE_URL }, async () => {
  const base = process.env.APP_BASE_URL.replace(/\/$/, "");
  const unauthorized = await fetch(`${base}/api/admin/leads`);
  assert.equal(unauthorized.status, 401);
  const dashboard = await fetch(`${base}/admin`, { redirect: "manual" });
  assert.equal(dashboard.status, 307);
  assert.match(dashboard.headers.get("location") || "", /\/admin\/login/);
  const createRoleUser = async (role) => {
    const u = await db.adminUser.create({ data: { name: `Fixture ${role}`, email: `${role.toLowerCase()}-${suffix}@example.invalid`, passwordHash: "integration-only-not-a-password", role } });
    fixtures.push(u);
    const raw = randomBytes(32).toString("base64url");
    await db.adminSession.create({ data: { userId: u.id, tokenHash: createHash("sha256").update(raw).digest("hex"), expiresAt: new Date(Date.now() + 5 * 60_000) } });
    return { user: u, cookie: `nextginx_admin_session=${raw}` };
  };
  const manager = await createRoleUser(AdminRole.SALES_MANAGER);
  const agent = await createRoleUser(AdminRole.SALES_AGENT);
  const editor = await createRoleUser(AdminRole.EDITOR);
  const call = (path, auth, init = {}) => fetch(`${base}${path}`, { ...init, headers: { ...(init.headers || {}), ...(auth ? { Cookie: auth.cookie } : {}) } });
  assert.equal((await call("/api/admin/leads", editor)).status, 403);
  const list = await call(`/api/admin/leads?q=${encodeURIComponent("Integration Lead")}&status=CONTACTED`, manager);
  assert.equal(list.status, 200);
  assert.equal((await list.json()).items.some((item) => item.id === lead.id), true);
  const detail = await call(`/api/admin/leads/${lead.id}`, manager);
  assert.equal(detail.status, 200);
  assert.equal((await call(`/api/admin/leads/${lead.id}`, agent)).status, 404);
  const assign = await call(`/api/admin/leads/${lead.id}`, manager, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assigneeId: agent.user.id }) });
  assert.equal(assign.status, 200);
  const own = await call(`/api/admin/leads/${lead.id}`, agent);
  assert.equal(own.status, 200);
  assert.equal((await own.json()).lead.assigneeId, agent.user.id);
  const update = await call(`/api/admin/leads/${lead.id}`, agent, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "QUALIFIED" }) });
  assert.equal(update.status, 200);
  const forbiddenAssignment = await call(`/api/admin/leads/${lead.id}`, agent, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assigneeId: null }) });
  assert.equal(forbiddenAssignment.status, 403);
  const note = await call(`/api/admin/leads/${lead.id}/notes`, agent, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: "API integration note" }) });
  assert.equal(note.status, 201);
  const history = await (await call(`/api/admin/leads/${lead.id}/notes`, agent)).json();
  assert.ok(history.notes.some((item) => item.body === "API integration note"));
  assert.ok(history.events.some((item) => item.action === "lead.assigned"));
  assert.ok(history.events.some((item) => item.action === "lead.status_changed"));
  assert.equal((await call("/api/admin/leads/export", agent)).status, 200);
  assert.equal((await call("/api/admin/content?locale=en", agent)).status, 403);

  const homeSnapshots = await db.contentEntry.findMany({ where: { type: "HOME", locale: { in: ["en", "ar"] }, slug: { in: ["home", "home-draft"] } } });
  try {
    for (const locale of ["en", "ar"]) {
      const headline = `CMS Integration ${locale} ${suffix}`;
      const save = await call("/api/admin/content", editor, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale, title: headline, summary: "Integration draft content not visible before publish." }) });
      assert.equal(save.status, 200);
      const draftPage = await fetch(`${base}/${locale}`, { cache: "no-store" });
      assert.equal(draftPage.status, 200);
      assert.equal((await draftPage.text()).includes(headline), false);
      const publish = await call("/api/admin/content", editor, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale }) });
      assert.equal(publish.status, 200);
      const publicPage = await fetch(`${base}/${locale}`, { cache: "no-store" });
      assert.equal((await publicPage.text()).includes(headline), true);
      const entry = await db.contentEntry.findUniqueOrThrow({ where: { type_locale_slug: { type: "HOME", locale, slug: "home" } } });
      assert.equal(entry.status, "PUBLISHED");
    }
  } finally {
    await db.contentEntry.deleteMany({ where: { type: "HOME", locale: { in: ["en", "ar"] }, slug: { in: ["home", "home-draft"] } } });
    for (const entry of homeSnapshots) await db.contentEntry.create({ data: { id: entry.id, type: entry.type, locale: entry.locale, slug: entry.slug, title: entry.title, summary: entry.summary, content: entry.content, ...(entry.seo !== null ? { seo: entry.seo } : {}), status: entry.status, projectType: entry.projectType, category: entry.category, displayOrder: entry.displayOrder, publishedAt: entry.publishedAt, authorId: entry.authorId, createdAt: entry.createdAt, updatedAt: entry.updatedAt } });
    await db.auditEvent.deleteMany({ where: { actorId: editor.user.id, action: { in: ["content.home_draft_saved", "content.home_published"] } } });
  }

  const contact = await fetch(`${base}/api/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Outbox Integration", email: `contact-${suffix}@example.invalid`, service: "Custom software", description: "An integration contact request for database verification." }) });
  assert.equal(contact.status, 201);
  const accepted = await contact.json(); extraLeads.push(accepted.id);
  const persisted = await db.lead.findUniqueOrThrow({ where: { id: accepted.id }, include: { events: true, emailOutboxes: true } });
  assert.equal(persisted.events.some((event) => event.action === "lead.created"), true);
  assert.equal(persisted.emailOutboxes.length, 1);
  assert.ok(["PENDING", "FAILED"].includes(persisted.emailOutboxes[0].status));

  const loginPassword = `Runtime-${randomUUID()}-Only!`;
  const loginUser = await db.adminUser.create({ data: { name: "Runtime Login Fixture", email: `login-${suffix}@example.invalid`, passwordHash: await argon2.hash(loginPassword, { type: argon2.argon2id }), role: AdminRole.ADMIN } });
  fixtures.push(loginUser);
  assert.equal((await fetch(`${base}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginUser.email, password: "invalid-password" }) })).status, 401);
  const loggedIn = await fetch(`${base}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginUser.email, password: loginPassword }) });
  assert.equal(loggedIn.status, 200);
  const setCookie = loggedIn.headers.get("set-cookie");
  assert.match(setCookie || "", /HttpOnly/i); assert.match(setCookie || "", /SameSite=Strict/i);
  if (process.env.TEST_SECURE_COOKIES === "1") assert.match(setCookie || "", /Secure/i);
  else assert.doesNotMatch(setCookie || "", /;\s*Secure/i);
  const rawToken = decodeURIComponent((setCookie || "").split(";")[0].split("=").slice(1).join("="));
  const session = await db.adminSession.findUniqueOrThrow({ where: { tokenHash: createHash("sha256").update(rawToken).digest("hex") } });
  assert.notEqual(session.tokenHash, rawToken);
  assert.equal((await fetch(`${base}/api/admin/leads`, { headers: { Cookie: `nextginx_admin_session=${rawToken}` } })).status, 200);
  const logout = await fetch(`${base}/api/admin/logout`, { method: "POST", headers: { Cookie: `nextginx_admin_session=${rawToken}`, Origin: base } });
  assert.equal(logout.status, 200);
  assert.ok((await db.adminSession.findUniqueOrThrow({ where: { id: session.id } })).revokedAt);
  assert.equal((await fetch(`${base}/api/admin/leads`, { headers: { Cookie: `nextginx_admin_session=${rawToken}` } })).status, 401);
  const expiringLogin = await fetch(`${base}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginUser.email, password: loginPassword }) });
  assert.equal(expiringLogin.status, 200);
  const expiringToken = decodeURIComponent((expiringLogin.headers.get("set-cookie") || "").split(";")[0].split("=").slice(1).join("="));
  const expiringSession = await db.adminSession.findUniqueOrThrow({ where: { tokenHash: createHash("sha256").update(expiringToken).digest("hex") } });
  await db.adminSession.update({ where: { id: expiringSession.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
  assert.equal((await fetch(`${base}/api/admin/leads`, { headers: { Cookie: `nextginx_admin_session=${expiringToken}` } })).status, 401);
  const inactive = await db.adminUser.create({ data: { name: "Inactive Login Fixture", email: `inactive-${suffix}@example.invalid`, passwordHash: await argon2.hash(loginPassword, { type: argon2.argon2id }), role: AdminRole.ADMIN, active: false } });
  fixtures.push(inactive);
  assert.equal((await fetch(`${base}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: inactive.email, password: loginPassword }) })).status, 401);
});
