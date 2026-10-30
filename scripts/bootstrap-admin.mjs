import { PrismaClient, AdminRole } from "@prisma/client";
import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();
const db = new PrismaClient();
try {
  const { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_NAME: name } = process.env;
  const generated = process.env.BOOTSTRAP_GENERATE_PASSWORD === "1";
  const password = generated ? randomBytes(32).toString("base64url") : process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !name || !password || password.length < 14) throw new Error("Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME, and either BOOTSTRAP_ADMIN_PASSWORD or BOOTSTRAP_GENERATE_PASSWORD=1.");
  if (await db.adminUser.count({ where: { role: AdminRole.SUPER_ADMIN } })) throw new Error("A Super Admin already exists; bootstrap is only allowed once.");
  if (await db.adminUser.findUnique({ where: { email: email.toLowerCase().trim() }, select: { id: true } })) throw new Error("An account with that email already exists; no changes were made.");
  await db.adminUser.create({ data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash: await argon2.hash(password, { type: argon2.argon2id }), role: AdminRole.SUPER_ADMIN } });
  console.log("Initial Super Admin created. Store the one-time password securely; it will not be shown again.");
  if (generated) console.log(`ONE_TIME_SUPER_ADMIN_PASSWORD=${password}`);
} finally { await db.$disconnect(); }
