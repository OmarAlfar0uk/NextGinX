import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin-login-form";
export const metadata = { title: "Admin login | NextGinX" };
export default async function AdminLoginPage() { if (await getSession()) redirect("/admin"); return <main className="admin-login-page"><Link href="/en" className="admin-brand">NextGinX<span> / Admin</span></Link><LoginForm /><p className="admin-login-note">Administrator accounts are provisioned through the secure bootstrap command.</p></main>; }
