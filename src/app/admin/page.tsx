import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import { AdminRole } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin dashboard | NextGinX" };
export default async function AdminDashboard() {
  const user = await getSession(); if (!user) redirect("/admin/login"); if (!can(user.role, "dashboard:read")) redirect("/admin/login");
  const leadScope = user.role === AdminRole.SALES_AGENT ? { assigneeId: user.id } : {};
  const [totalLeads, newLeads, projects, services, articles, recent] = await Promise.all([
    db.lead.count({ where: leadScope }), db.lead.count({ where: { ...leadScope, status: "NEW" } }),
    db.contentEntry.count({ where: { type: "PROJECT", status: "PUBLISHED" } }), db.contentEntry.count({ where: { type: "SERVICE", status: "PUBLISHED" } }), db.contentEntry.count({ where: { type: "ARTICLE", status: "PUBLISHED" } }),
    db.lead.findMany({ where: leadScope, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, name: true, email: true, service: true, status: true, createdAt: true } }),
  ]);
  return <main className="admin-area"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand">NextGinX<span> / Admin</span></Link><nav><Link href="/admin" aria-current="page">Overview</Link><Link href="/admin/leads">Leads</Link>{can(user.role, "content:write") && <Link href="/admin/content">Homepage editor</Link>}</nav><form action="/api/admin/logout" method="post"><button>Sign out</button></form></aside><section className="admin-main"><header className="admin-top"><div><span className="eyebrow eyebrow-dark"><i />ADMINISTRATION</span><h1>Good day, {user.name}</h1></div><span className="admin-role">{user.role.replaceAll("_", " ")}</span></header><div className="admin-stats">{[["Total leads", totalLeads], ["New leads", newLeads], ["Published projects", projects], ["Published services", services], ["Published articles", articles]].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><section className="admin-table-card"><h2>Recent enquiries</h2>{recent.length ? <div className="admin-table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Service</th><th>Status</th><th>Received</th></tr></thead><tbody>{recent.map((lead) => <tr key={lead.id}><td><Link href={`/admin/leads/${lead.id}`}>{lead.name}</Link></td><td>{lead.email}</td><td>{lead.service}</td><td>{lead.status.replaceAll("_", " ")}</td><td>{lead.createdAt.toLocaleDateString()}</td></tr>)}</tbody></table></div> : <p className="admin-empty">No enquiries have been received.</p>}</section></section></main>;
}
