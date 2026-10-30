import { NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
export const dynamic = "force-dynamic";
const noteSchema = z.object({ body: z.string().trim().min(1).max(5000) });
async function allowedLead(leadId: string, user: { id: string; role: AdminRole }) {
  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { id: true, assigneeId: true } });
  return lead && (user.role !== AdminRole.SALES_AGENT || lead.assigneeId === user.id) ? lead : null;
}
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession(); if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(user.role, "leads:read")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params; if (!await allowedLead(id, user)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const [notes, events] = await Promise.all([db.leadNote.findMany({ where: { leadId: id }, orderBy: { createdAt: "desc" }, include: { author: { select: { id: true, name: true } } } }), db.leadEvent.findMany({ where: { leadId: id }, orderBy: { createdAt: "desc" }, include: { actor: { select: { id: true, name: true } } } })]);
  return NextResponse.json({ notes, events }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSession(); if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(user.role, "leads:read") || user.role === AdminRole.EDITOR) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const parsed = noteSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { id } = await params; if (!await allowedLead(id, user)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const note = await db.$transaction(async (tx) => { const created = await tx.leadNote.create({ data: { leadId: id, authorId: user.id, body: parsed.data.body } }); await tx.leadEvent.create({ data: { leadId: id, actorId: user.id, action: "lead.note_added" } }); return created; });
  return NextResponse.json({ id: note.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
