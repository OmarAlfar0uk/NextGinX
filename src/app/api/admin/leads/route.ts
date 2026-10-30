import { NextResponse } from "next/server";
import { LeadStatus, AdminRole, Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const user = await getSession(); if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(user.role, "leads:read")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const url = new URL(request.url); const page = Math.max(1, Math.min(10000, Number(url.searchParams.get("page") || 1) || 1)); const take = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 25) || 25));
  const q = (url.searchParams.get("q") || "").trim().slice(0, 100); const status = url.searchParams.get("status"); const assigneeId = url.searchParams.get("assigneeId");
  const where: Prisma.LeadWhereInput = { ...(user.role === AdminRole.SALES_AGENT ? { assigneeId: user.id } : {}), ...(status && Object.values(LeadStatus).includes(status as LeadStatus) ? { status: status as LeadStatus } : {}), ...(assigneeId && user.role !== AdminRole.SALES_AGENT ? { assigneeId } : {}), ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] } : {}) };
  const [total, items] = await Promise.all([db.lead.count({ where }), db.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take, select: { id: true, name: true, company: true, email: true, service: true, status: true, assignee: { select: { id: true, name: true, email: true } }, createdAt: true } })]);
  return NextResponse.json({ items, page, limit: take, total, pages: Math.ceil(total / take) }, { headers: { "Cache-Control": "no-store" } });
}

const schema = z.object({ status: z.nativeEnum(LeadStatus).optional(), assigneeId: z.string().cuid().nullable().optional() }).refine((value) => value.status || value.assigneeId !== undefined);
export async function PATCH(request: Request) {
  const user = await getSession(); if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(user.role, "leads:manage")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const changes = parsed.data;
  const leadId = new URL(request.url).searchParams.get("id"); if (!leadId) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true, status: true, assigneeId: true } }); if (!lead) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (changes.assigneeId && !await db.adminUser.findFirst({ where: { id: changes.assigneeId, active: true, role: { in: [AdminRole.SALES_AGENT, AdminRole.SALES_MANAGER] } } })) return NextResponse.json({ error: "invalid_assignee" }, { status: 400 });
  await db.$transaction(async (tx) => {
    const data = { ...(changes.status ? { status: changes.status } : {}), ...(changes.assigneeId !== undefined ? { assigneeId: changes.assigneeId } : {}) };
    await tx.lead.update({ where: { id: lead.id }, data });
    if (changes.status && changes.status !== lead.status) await tx.leadEvent.create({ data: { leadId: lead.id, actorId: user.id, action: "lead.status_changed", metadata: { from: lead.status, to: changes.status } } });
    if (changes.assigneeId !== undefined && changes.assigneeId !== lead.assigneeId) await tx.leadEvent.create({ data: { leadId: lead.id, actorId: user.id, action: "lead.assigned", metadata: { from: lead.assigneeId, to: changes.assigneeId } } });
  });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
