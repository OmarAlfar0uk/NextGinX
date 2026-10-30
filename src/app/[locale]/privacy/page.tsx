import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { copy, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; const t = copy(locale); return pageMetadata(locale, "/privacy", t.legal.privacyTitle, t.legal.placeholder); }
export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: value } = await params; if (!isLocale(value)) notFound(); const t = copy(value); return <section className="legal-page wrap"><span className="eyebrow eyebrow-dark"><i />{value === "ar" ? "معلومات قانونية" : "Legal information"}</span><h1>{t.legal.privacyTitle}</h1><div className="legal-placeholder"><span className="concept-tag">{value === "ar" ? "مسودة قابلة للتحرير" : "Editable placeholder"}</span><p>{t.legal.placeholder}</p><small>{t.legal.edited}</small></div></section>; }
