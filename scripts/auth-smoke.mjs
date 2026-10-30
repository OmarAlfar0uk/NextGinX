import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { PrismaClient, AdminRole } from "@prisma/client";
import argon2 from "argon2";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();
const base = (process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const email = process.env.BOOTSTRAP_ADMIN_EMAIL || "omaralfarouk646@gmail.com";
async function readPassword() {
  if (process.env.BOOTSTRAP_TEST_PASSWORD) return process.env.BOOTSTRAP_TEST_PASSWORD;
  process.stdout.write("Enter the one-time Super Admin password (input is not echoed): ");
  if (!process.stdin.isTTY) throw new Error("Run with an interactive terminal or provide BOOTSTRAP_TEST_PASSWORD through a protected process environment.");
  return await new Promise((resolve, reject) => {
    const input = process.stdin; let value = "";
    input.setRawMode(true); input.resume();
    const onData = (buffer) => {
      const char = buffer.toString("utf8");
      if (char === "\u0003") { input.setRawMode(false); input.off("data", onData); reject(new Error("Interrupted")); return; }
      if (char === "\r" || char === "\n") { input.setRawMode(false); input.off("data", onData); process.stdout.write("\n"); resolve(value); return; }
      if (char === "\u007f" || char === "\b") value = value.slice(0, -1); else value += char;
    };
    input.on("data", onData);
  });
}
const password = await readPassword();
if (!password) throw new Error("No test password supplied.");
const db = new PrismaClient();
const cookieToken = (response) => {
  const header = response.headers.get("set-cookie");
  assert.ok(header, "Expected session cookie");
  return { header, cookie: header.split(";")[0], raw: decodeURIComponent(header.split(";")[0].split("=").slice(1).join("=")) };
};
const hash = (token) => createHash("sha256").update(token).digest("hex");
const login = async (userEmail, secret) => fetch(`${base}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, password: secret }) });

let editor;
try {
  const owner = await db.adminUser.findUnique({ where: { email }, select: { id: true, passwordHash: true, active: true, role: true } });
  assert.ok(owner, "Bootstrapped owner account must exist");
  assert.equal(owner.role, AdminRole.SUPER_ADMIN);
  assert.equal(owner.active, true);
  assert.ok(await argon2.verify(owner.passwordHash, password), "Stored Argon2 hash must verify the one-time password");

  const bad = await login(email, `${password}incorrect`);
  assert.equal(bad.status, 401, "Invalid password should be rejected generically");

  const before = await db.adminSession.count({ where: { userId: owner.id } });
  const good = await login(email, password);
  assert.equal(good.status, 200);
  const first = cookieToken(good);
  assert.match(first.header, /HttpOnly/i);
  assert.match(first.header, /SameSite=Strict/i);
  assert.ok(first.raw.length >= 40);
  const firstSession = await db.adminSession.findUnique({ where: { tokenHash: hash(first.raw) } });
  assert.ok(firstSession);
  assert.notEqual(firstSession.tokenHash, first.raw, "Database must contain only the token hash");
  assert.ok(firstSession.expiresAt > new Date());
  assert.equal(await db.adminSession.count({ where: { userId: owner.id } }), before + 1);
  const protectedResponse = await fetch(`${base}/api/admin/leads`, { headers: { Cookie: first.cookie } });
  assert.equal(protectedResponse.status, 200, "Super Admin should access lead listing");

  await db.adminSession.update({ where: { id: firstSession.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
  const expired = await fetch(`${base}/api/admin/leads`, { headers: { Cookie: first.cookie } });
  assert.equal(expired.status, 401, "Expired session must be rejected");

  const secondLogin = await login(email, password); assert.equal(secondLogin.status, 200);
  const second = cookieToken(secondLogin);
  const secondSession = await db.adminSession.findUnique({ where: { tokenHash: hash(second.raw) } }); assert.ok(secondSession);
  const logout = await fetch(`${base}/api/admin/logout`, { method: "POST", headers: { Cookie: second.cookie, Origin: base } });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie") || "", /max-age=0/i);
  assert.ok((await db.adminSession.findUniqueOrThrow({ where: { id: secondSession.id } })).revokedAt);
  assert.equal((await fetch(`${base}/api/admin/leads`, { headers: { Cookie: second.cookie } })).status, 401);

  await db.adminUser.update({ where: { id: owner.id }, data: { active: false } });
  try { assert.equal((await login(email, password)).status, 401, "Inactive accounts must be rejected"); }
  finally { await db.adminUser.update({ where: { id: owner.id }, data: { active: true } }); }

  const editorPassword = `Editor-${randomUUID()}-Only!`;
  editor = await db.adminUser.create({ data: { name: "Auth Test Editor", email: `auth-editor-${randomUUID()}@example.invalid`, passwordHash: await argon2.hash(editorPassword, { type: argon2.argon2id }), role: AdminRole.EDITOR } });
  const editorLogin = await login(editor.email, editorPassword); assert.equal(editorLogin.status, 200);
  const editorCookie = cookieToken(editorLogin);
  assert.equal((await fetch(`${base}/api/admin/leads`, { headers: { Cookie: editorCookie.cookie } })).status, 403, "Editor must not read sales leads");

  console.log(JSON.stringify({ invalidPassword: "401", validLogin: "200", cookie: "HttpOnly; SameSite=Strict", storedSessionToken: "hashed", expiry: "401", logout: "revoked and 401", inactiveAccount: "401", editorLeadAccess: "403" }));
} finally {
  if (editor) await db.adminUser.deleteMany({ where: { id: editor.id } });
  await db.$disconnect();
}
