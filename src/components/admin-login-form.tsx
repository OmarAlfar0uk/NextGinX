"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export function LoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const form = new FormData(event.currentTarget); try { const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) }); if (!response.ok) { setError(response.status === 503 ? "Admin sign-in is temporarily unavailable." : "Email or password is incorrect."); setBusy(false); return; } router.replace("/admin"); router.refresh(); } catch { setError("Unable to sign in. Please try again."); setBusy(false); } }
  return <form className="admin-login-card" onSubmit={submit}><span className="eyebrow eyebrow-dark"><i />SECURE ACCESS</span><h1>Welcome back</h1><p>Sign in to manage your website.</p><label>Email<input name="email" type="email" required autoComplete="username" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label><button className="button button-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>{error && <p className="form-message error" role="alert">{error}</p>}</form>;
}
