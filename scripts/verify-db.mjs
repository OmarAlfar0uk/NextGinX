import { PrismaClient, AdminRole, OutboxStatus } from "@prisma/client";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured in .env.local or .env.");
const db = new PrismaClient();
try {
  const [identity] = await db.$queryRaw`SELECT current_database() AS database, current_setting('server_version') AS version`;
  const [migrations, users, supers, leads, pending, failed] = await Promise.all([
    db.$queryRaw`SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY started_at`,
    db.adminUser.count(),
    db.adminUser.count({ where: { role: AdminRole.SUPER_ADMIN } }),
    db.lead.count(),
    db.emailOutbox.count({ where: { status: { in: [OutboxStatus.PENDING, OutboxStatus.SENDING] } } }),
    db.emailOutbox.count({ where: { status: OutboxStatus.FAILED } }),
  ]);
  const requestedOwner = await db.adminUser.findUnique({ where: { email: "omaralfarouk646@gmail.com" }, select: { name: true, role: true, active: true } });
  console.log(JSON.stringify({ connection: "ok", database: identity.database, postgresVersion: identity.version, appliedMigrations: migrations.map((row) => row.migration_name), adminUsers: users, superAdmins: supers, requestedOwner: requestedOwner ? { name: requestedOwner.name, role: requestedOwner.role, active: requestedOwner.active } : null, leads, outbox: { pendingOrSending: pending, failed } }, null, 2));
} finally { await db.$disconnect(); }
