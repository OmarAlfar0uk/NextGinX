"use client";

import { FormEvent, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { Icon } from "@/components/icons";

export function ContactForm({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const [state, setState] = useState<"idle" | "sending" | "success" | "error" | "not-configured">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json() as { error?: string };
      if (response.ok) { form.reset(); setState("success"); }
      else if (response.status === 503) setState("not-configured");
      else { setError(result.error === "invalid" ? t.formErrors.generic : t.contact.error); setState("error"); }
    } catch {
      setState("error");
      setError(t.contact.error);
    }
  }
  return <form className="contact-form" onSubmit={submit}>
    <div className="form-grid">
      <label>{t.contact.name} <span>*</span><input name="name" required maxLength={120} autoComplete="name" placeholder={locale === "ar" ? "الاسم الكامل" : "Your full name"} onInvalid={(event) => event.currentTarget.setCustomValidity(t.formErrors.name)} onChange={(event) => event.currentTarget.setCustomValidity("")} /></label>
      <label>{t.contact.company} <small>{t.contact.optional}</small><input name="company" maxLength={160} autoComplete="organization" placeholder={locale === "ar" ? "اسم المؤسسة" : "Your organization"} /></label>
      <label>{t.contact.email} <span>*</span><input name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@company.com" onInvalid={(event) => event.currentTarget.setCustomValidity(t.formErrors.email)} onChange={(event) => event.currentTarget.setCustomValidity("")} /></label>
      <label>{t.contact.phone} <small>{t.contact.optional}</small><input name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="+20 ..." /></label>
      <label>{t.contact.country} <small>{t.contact.optional}</small><input name="country" maxLength={80} autoComplete="country-name" placeholder={locale === "ar" ? "الدولة" : "Country or region"} /></label>
      <label>{t.contact.service} <span>*</span><select name="service" required defaultValue="" onInvalid={(event) => event.currentTarget.setCustomValidity(t.formErrors.service)} onChange={(event) => event.currentTarget.setCustomValidity("")}><option value="" disabled>{t.contact.select}</option>{t.contact.serviceOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
      <label>{t.contact.budget} <small>{t.contact.optional}</small><select name="budget" defaultValue=""><option value="">{t.contact.select}</option>{t.contact.budgetOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
      <label>{t.contact.preferred} <small>{t.contact.optional}</small><select name="preferred" defaultValue=""><option value="">{t.contact.select}</option>{t.contact.contactOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
      <label className="form-wide">{t.contact.description} <span>*</span><textarea name="description" rows={5} required minLength={10} maxLength={3000} placeholder={locale === "ar" ? "ما الذي تريد بناءه أو تحسينه؟" : "What are you looking to build or improve?"} onInvalid={(event) => event.currentTarget.setCustomValidity(t.formErrors.description)} onChange={(event) => event.currentTarget.setCustomValidity("")} /></label>
      <label className="honeypot" aria-hidden="true" tabIndex={-1}>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
    <div className="form-submit"><button className="button button-primary" type="submit" disabled={state === "sending"}>{state === "sending" ? t.contact.sending : t.contact.send}<Icon name={state === "sending" ? "chevron" : locale === "ar" ? "arrowLeft" : "arrow"} size={17} /></button><p>{t.contact.privacy}</p></div>
    {state === "success" && <p className="form-message success" role="status"><Icon name="check" size={18} />{t.contact.success}</p>}
    {state === "not-configured" && <p className="form-message warning" role="status">{t.contact.notConfigured}</p>}
    {state === "error" && <p className="form-message error" role="alert">{error}</p>}
  </form>;
}
