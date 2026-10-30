import { PrismaClient, OutboxStatus } from "@prisma/client";
import { loadLocalEnv } from "./load-local-env.mjs";

loadLocalEnv();
const db = new PrismaClient();
const maxAttempts = 5;
const batchSize = 25;
const backoffMs = (attempt) => Math.min(60 * 60_000, 30_000 * (2 ** Math.max(0, attempt - 1)));

async function main() {
  const { RESEND_API_KEY: key, CONTACT_FROM_EMAIL: from } = process.env;
  if (!key || !from) { console.error("Outbox worker requires RESEND_API_KEY and CONTACT_FROM_EMAIL."); process.exitCode = 2; return; }
  const now = new Date();
  const staleBefore = new Date(now.getTime() - 5 * 60_000);
  await db.emailOutbox.updateMany({ where: { status: OutboxStatus.SENDING, lockedAt: { lt: staleBefore }, attempts: { lt: maxAttempts } }, data: { status: OutboxStatus.FAILED, lockedAt: null, nextAttemptAt: now, lastError: "Previous delivery worker lease expired" } });
  await db.emailOutbox.updateMany({ where: { status: OutboxStatus.SENDING, lockedAt: { lt: staleBefore }, attempts: { gte: maxAttempts } }, data: { status: OutboxStatus.FAILED, lockedAt: null, nextAttemptAt: new Date("9999-12-31T00:00:00Z"), lastError: "Delivery retry limit reached after worker lease expired" } });
  const jobs = await db.emailOutbox.findMany({ where: { status: { in: [OutboxStatus.PENDING, OutboxStatus.FAILED] }, attempts: { lt: maxAttempts }, nextAttemptAt: { lte: now }, recipient: { not: "" } }, orderBy: { createdAt: "asc" }, take: batchSize, select: { id: true, leadId: true, recipient: true, subject: true, body: true, attempts: true } });
  let sent = 0, retried = 0, exhausted = 0;
  for (const job of jobs) {
    const lockedAt = new Date();
    const claim = await db.emailOutbox.updateMany({ where: { id: job.id, status: { in: [OutboxStatus.PENDING, OutboxStatus.FAILED] }, attempts: job.attempts, nextAttemptAt: { lte: lockedAt }, lockedAt: null }, data: { status: OutboxStatus.SENDING, lockedAt, attempts: { increment: 1 } } });
    if (!claim.count) continue;
    const attempt = job.attempts + 1;
    try {
      const response = await fetch("https://api.resend.com/emails", { method: "POST", signal: AbortSignal.timeout(8000), headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `nextginx-outbox-${job.id}` }, body: JSON.stringify({ from, to: [job.recipient], subject: job.subject, text: job.body }) });
      if (response.ok) { await db.$transaction([db.emailOutbox.update({ where: { id: job.id }, data: { status: OutboxStatus.SENT, lockedAt: null, sentAt: new Date(), lastError: null } }), db.lead.update({ where: { id: job.leadId }, data: { emailDelivered: true, emailError: null } })]); sent++; }
      else throw new Error(`Resend HTTP ${response.status}`);
    } catch (error) {
      const final = attempt >= maxAttempts;
      const safeError = error instanceof Error && /^Resend HTTP \d{3}$/.test(error.message) ? error.message : "Delivery request failed";
      await db.$transaction([db.emailOutbox.update({ where: { id: job.id }, data: { status: OutboxStatus.FAILED, lockedAt: null, nextAttemptAt: final ? new Date("9999-12-31T00:00:00Z") : new Date(Date.now() + backoffMs(attempt)), lastError: safeError } }), db.lead.update({ where: { id: job.leadId }, data: { emailDelivered: false, emailError: safeError } })]);
      if (final) exhausted++; else retried++;
    }
  }
  console.log(JSON.stringify({ examined: jobs.length, sent, scheduledForRetry: retried, exhausted }));
}
main().catch(() => { console.error("Outbox worker failed; see service health and database connectivity."); process.exitCode = 1; }).finally(() => db.$disconnect());
