import { NextResponse } from "next/server";
import { AdminRole, LeadStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession(); if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(user.role, "leads:read")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id }, include: { assignee: { select: { id: true, name: true, email: true, role: true } }, notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { id: true, name: true } } } }, events: { orderBy: { createdAt: "desc" }, include: { actor: { select: { id: true, name: true } } } }, emailOutboxes: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, attempts: true, lastError: true, nextAttemptAt: true, sentAt: true } } } });
  if (!lead || (user.role === AdminRole.SALES_AGENT && lead.assigneeId !== user.id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ lead }, { headers: { "Cache-Control": "no-store" } });
}
const updateSchema = z.object({ status: z.nativeEnum(LeadStatus).optional(), assigneeId: z.string().cuid().nullable().optional(), name: z.string().trim().min(1).max(120).optional(), company: z.string().trim().max(160).nullable().optional(), email: z.string().email().max(254).optional(), phone: z.string().max(40).nullable().optional(), country: z.string().max(80).nullable().optional(), service: z.string().trim().min(1).max(100).optional(), budget: z.string().max(100).nullable().optional(), description: z.string().trim().min(1).max(3000).optional(), preferredContact: z.string().max(50).nullable().optional() }).refine((v) => Object.keys(v).length > 0);
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession(); if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const agent = user.role === AdminRole.SALES_AGENT;
  if (!can(user.role, "leads:manage") && !agent) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (agent && (parsed.data.assigneeId !== undefined || Object.keys(parsed.data).some((key) => !["status"].includes(key)))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id }, select: { id: true, status: true, assigneeId: true } });
  if (!lead || (agent && lead.assigneeId !== user.id)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const changes = parsed.data;
  if (changes.assigneeId && !await db.adminUser.findFirst({ where: { id: changes.assigneeId, active: true, role: { in: [AdminRole.SALES_AGENT, AdminRole.SALES_MANAGER] } }, select: { id: true } })) return NextResponse.json({ error: "invalid_assignee" }, { status: 400 });
  await db.$transaction(async (tx) => {
    await tx.lead.update({ where: { id }, data: { ...changes, ...(changes.email ? { email: changes.email.toLowerCase() } : {}) } });
    if (changes.status && changes.status !== lead.status) await tx.leadEvent.create({ data: { leadId: id, actorId: user.id, action: "lead.status_changed", metadata: { from: lead.status, to: changes.status } } });
    if (changes.assigneeId !== undefined && changes.assigneeId !== lead.assigneeId) await tx.leadEvent.create({ data: { leadId: id, actorId: user.id, action: "lead.assigned", metadata: { from: lead.assigneeId, to: changes.assigneeId } } });
    const fields = Object.keys(changes).filter((field) => field !== "status" && field !== "assigneeId");
    if (fields.length) await tx.leadEvent.create({ data: { leadId: id, actorId: user.id, action: "lead.contact_updated", metadata: { fields } } });
  });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
