import { redirect } from "next/navigation";
import { AdminRole } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import LeadsTable from "@/components/admin-leads-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads | NextGinX Admin" };

export default async function LeadsPage() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (!can(user.role, "leads:read")) redirect("/admin");
  const representatives = user.role === AdminRole.SALES_AGENT ? [] : await db.adminUser.findMany({
    where: { active: true, role: { in: [AdminRole.SALES_AGENT, AdminRole.SALES_MANAGER] } },
    select: { id: true, name: true }, orderBy: { name: "asc" },
  });
  return <LeadsTable representatives={representatives} />;
}
