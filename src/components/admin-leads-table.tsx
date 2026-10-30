"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "MEETING_SCHEDULED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"];
type Representative = { id: string; name: string };
type Lead = { id: string; name: string; company: string | null; email: string; service: string; status: string; createdAt: string; assignee: Representative | null };
type Result = { items: Lead[]; page: number; pages: number; total: number };

export default function LeadsTable({ representatives }: { representatives: Representative[] }) {
  const [q, setQ] = useState(""); const [status, setStatus] = useState(""); const [assigneeId, setAssigneeId] = useState("");
  const [page, setPage] = useState(1); const [result, setResult] = useState<Result | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    const params = new URLSearchParams({ page: String(page), limit: "25" });
    if (q.trim()) params.set("q", q.trim()); if (status) params.set("status", status); if (assigneeId) params.set("assigneeId", assigneeId);
    try { const response = await fetch(`/api/admin/leads?${params}`, { cache: "no-store" }); if (!response.ok) throw new Error("Unable to load leads."); setResult(await response.json()); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to load leads."); }
    finally { setLoading(false); }
  }, [page, q, status, assigneeId]);
  useEffect(() => { const timer = setTimeout(() => { void load(); }, 180); return () => clearTimeout(timer); }, [load]);
  function updateFilter(setter: (value: string) => void, value: string) { setter(value); setPage(1); }
  const exportParams = new URLSearchParams(); if (q.trim()) exportParams.set("q", q.trim()); if (status) exportParams.set("status", status); if (assigneeId) exportParams.set("assigneeId", assigneeId);

  return <main className="admin-area"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand">NextGinX<span> / Admin</span></Link><nav><Link href="/admin">Overview</Link><Link href="/admin/leads" aria-current="page">Leads</Link></nav><form action="/api/admin/logout" method="post"><button>Sign out</button></form></aside><section className="admin-main">
    <header className="admin-top"><div><span className="eyebrow eyebrow-dark"><i />SALES CRM</span><h1>Contact leads</h1><p>Search, prioritize, and follow up on enquiries.</p></div><a className="admin-action" href={`/api/admin/leads/export${exportParams.size ? `?${exportParams}` : ""}`}>Export CSV</a></header>
    <section className="admin-table-card"><div className="lead-filters"><label>Search<input value={q} onChange={(e) => updateFilter(setQ, e.target.value)} placeholder="Name, email, company" /></label><label>Status<select value={status} onChange={(e) => updateFilter(setStatus, e.target.value)}><option value="">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></label>{representatives.length > 0 && <label>Representative<select value={assigneeId} onChange={(e) => updateFilter(setAssigneeId, e.target.value)}><option value="">All representatives</option>{representatives.map((rep) => <option key={rep.id} value={rep.id}>{rep.name}</option>)}</select></label>}</div>
    {error ? <p className="admin-error" role="alert">{error}</p> : loading ? <p className="admin-empty" role="status">Loading leads…</p> : result?.items.length ? <><div className="admin-table-scroll"><table><thead><tr><th>Lead</th><th>Service</th><th>Status</th><th>Assigned to</th><th>Received</th><th></th></tr></thead><tbody>{result.items.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><br /><span>{lead.company || lead.email}</span></td><td>{lead.service}</td><td><span className="lead-status">{lead.status.replaceAll("_", " ")}</span></td><td>{lead.assignee?.name || "Unassigned"}</td><td>{new Date(lead.createdAt).toLocaleDateString()}</td><td><Link href={`/admin/leads/${lead.id}`}>Open</Link></td></tr>)}</tbody></table></div><div className="lead-pagination"><span>{result.total} leads · Page {result.page} of {Math.max(result.pages, 1)}</span><div><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button><button disabled={page >= result.pages} onClick={() => setPage((p) => p + 1)}>Next</button></div></div></> : <p className="admin-empty">No leads match these filters.</p>}
    </section></section></main>;
}
