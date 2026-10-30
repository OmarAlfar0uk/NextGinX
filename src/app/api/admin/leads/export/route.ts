import { NextResponse } from "next/server";
import { AdminRole, LeadStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
export const dynamic = "force-dynamic";
const cell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
export async function GET(request: Request) {
  const user = await getSession(); if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(user.role, "leads:read")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const url = new URL(request.url); const q = (url.searchParams.get("q") || "").slice(0, 100); const value = url.searchParams.get("status"); const assigneeId = url.searchParams.get("assigneeId");
  const where: Prisma.LeadWhereInput = { ...(user.role === AdminRole.SALES_AGENT ? { assigneeId: user.id } : {}), ...(value && Object.values(LeadStatus).includes(value as LeadStatus) ? { status: value as LeadStatus } : {}), ...(assigneeId && user.role !== AdminRole.SALES_AGENT ? { assigneeId } : {}), ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] } : {}) };
  const rows = await db.lead.findMany({ where, orderBy: { createdAt: "desc" }, take: 5000, select: { name: true, company: true, email: true, phone: true, country: true, service: true, budget: true, status: true, createdAt: true } });
  const content = [["Name", "Company", "Email", "Phone", "Country", "Service", "Budget", "Status", "Created"], ...rows.map((row) => [row.name, row.company, row.email, row.phone, row.country, row.service, row.budget, row.status, row.createdAt.toISOString()])].map((row) => row.map(cell).join(",")).join("\r\n");
  return new Response(content, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=nextginx-leads.csv", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
