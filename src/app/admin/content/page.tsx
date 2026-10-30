import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import HomeContentEditor from "@/components/admin-home-content-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Homepage editor | NextGinX Admin" };

export default async function HomeContentPage() {
  const user = await getSession(); if (!user) redirect("/admin/login");
  if (!can(user.role, "content:write")) redirect("/admin");
  return <main className="admin-area"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand">NextGinX<span> / Admin</span></Link><nav><Link href="/admin">Overview</Link><Link href="/admin/leads">Leads</Link><Link href="/admin/content" aria-current="page">Homepage editor</Link></nav><form action="/api/admin/logout" method="post"><button>Sign out</button></form></aside><section className="admin-main"><header className="admin-top"><div><span className="eyebrow eyebrow-dark"><i />WEBSITE CONTENT</span><h1>Homepage hero</h1><p>Save an unpublished draft, then publish each language independently.</p></div></header><HomeContentEditor /></section></main>;
}
