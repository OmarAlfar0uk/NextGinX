"use client";

import { useEffect, useState } from "react";

type Entry = { title: string; summary: string | null; status: string; updatedAt: string } | null;
type ContentState = { draft: Entry; published: Entry };

export default function HomeContentEditor() {
  const [locale, setLocale] = useState<"en" | "ar">("en"); const [title, setTitle] = useState(""); const [summary, setSummary] = useState("");
  const [published, setPublished] = useState<Entry>(null); const [hasDraft, setHasDraft] = useState(false); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true; setLoading(true); setMessage("");
    fetch("/api/admin/content?locale=" + locale, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Unable to load homepage content.");
      return response.json() as Promise<ContentState>;
    }).then((data) => { if (!active) return; const entry = data.draft || data.published; setTitle(entry?.title || ""); setSummary(entry?.summary || ""); setHasDraft(Boolean(data.draft)); setPublished(data.published); })
      .catch((error: unknown) => { if (active) setMessage(error instanceof Error ? error.message : "Unable to load content."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [locale]);
  async function saveDraft() {
    const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale, title, summary }) });
    if (!response.ok) throw new Error("Could not save the draft.");
    setHasDraft(true);
  }
  async function save() {
    setBusy(true); setMessage("");
    try { await saveDraft(); setMessage("Draft saved. The public homepage is unchanged until you publish."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save the draft."); }
    finally { setBusy(false); }
  }
  async function publish() {
    setBusy(true); setMessage("");
    try {
      await saveDraft();
      const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale }) });
      if (!response.ok) throw new Error("Could not publish the homepage.");
      setPublished({ title, summary: summary || null, status: "PUBLISHED", updatedAt: new Date().toISOString() }); setHasDraft(false); setMessage("Published. The public homepage now shows this language version.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not publish."); }
    finally { setBusy(false); }
  }
  return <section className="admin-table-card cms-editor-card">
    <div className="lead-filters cms-locale-tabs"><label>Language<select value={locale} disabled={busy || loading} onChange={(event) => setLocale(event.target.value as "en" | "ar")}><option value="en">English (LTR)</option><option value="ar">Arabic (RTL)</option></select></label><div className="cms-state"><span>Published</span><strong>{published ? "Yes" : "No published override"}</strong></div><div className="cms-state"><span>Draft</span><strong>{hasDraft ? "Unpublished changes" : "No draft"}</strong></div></div>
    {loading ? <p className="admin-empty" role="status">Loading editor…</p> : <div className="cms-editor-fields"><label>Hero headline<input value={title} maxLength={240} onChange={(event) => setTitle(event.target.value)} dir={locale === "ar" ? "rtl" : "ltr"} /></label><label>Supporting text<textarea value={summary} maxLength={1000} rows={5} onChange={(event) => setSummary(event.target.value)} dir={locale === "ar" ? "rtl" : "ltr"} /></label><p>Headline and supporting text render in the selected language. Empty published content falls back to the current site copy.</p><div className="cms-editor-actions"><button disabled={busy || loading || !title.trim()} onClick={() => void save()}>Save draft</button><button disabled={busy || loading || !title.trim()} onClick={() => void publish()}>Publish</button></div></div>}
    {message && <p className="admin-feedback" role="status">{message}</p>}
  </section>;
}
