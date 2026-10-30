import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminRole } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import LeadDetail from "@/components/admin-lead-detail";

export const dynamic = "force-dynamic";
export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession(); if (!user) redirect("/admin/login"); if (!can(user.role, "leads:read")) redirect("/admin");
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id }, include: { assignee: { select: { id: true, name: true } }, notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true } } } }, events: { orderBy: { createdAt: "desc" }, include: { actor: { select: { name: true } } } } } });
  if (!lead || (user.role === AdminRole.SALES_AGENT && lead.assigneeId !== user.id)) notFound();
  const representatives = user.role === AdminRole.SALES_AGENT ? [] : await db.adminUser.findMany({ where: { active: true, role: { in: [AdminRole.SALES_AGENT, AdminRole.SALES_MANAGER] } }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  return <main className="admin-area"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand">NextGinX<span> / Admin</span></Link><nav><Link href="/admin">Overview</Link><Link href="/admin/leads" aria-current="page">Leads</Link></nav><form action="/api/admin/logout" method="post"><button>Sign out</button></form></aside><section className="admin-main"><Link className="lead-back" href="/admin/leads">← All leads</Link><LeadDetail lead={JSON.parse(JSON.stringify(lead))} representatives={representatives} canManage={user.role !== AdminRole.SALES_AGENT} /></section></main>;
}
