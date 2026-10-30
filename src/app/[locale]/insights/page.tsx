import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { copy, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { PageIntro } from "@/components/page-intro";
import { CtaBand } from "@/components/cta-band";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; const t = copy(locale); return pageMetadata(locale, "/insights", t.nav.insights, t.insights.intro); }
export default async function InsightsPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: value } = await params; if (!isLocale(value)) notFound(); const t = copy(value);
  return <><PageIntro eyebrow={t.insights.eyebrow} title={t.insights.title} text={t.insights.intro} /><section className="insights-section section-pad"><div className="wrap"><div className="insights-empty"><div className="insights-visual"><div className="insights-paper"><span className="paper-icon"><BookOpen size={21} /></span><i /><i /><i /><i /><b /></div><span className="paper-orbit orbit-a" /><span className="paper-orbit orbit-b" /></div><div className="insights-message"><span className="concept-tag">{t.insights.badge}</span><h2>{t.insights.emptyTitle}</h2><p>{t.insights.emptyText}</p><div className="insights-topics">{(value === "ar" ? ["هندسة البرمجيات", "تطوير SaaS", "التحول الرقمي", "أتمتة الأعمال"] : ["Software engineering", "SaaS development", "Digital transformation", "Business automation"]).map((topic) => <span key={topic}><ArrowUpRight size={14} />{topic}</span>)}</div></div></div></div></section><CtaBand locale={value} /></>;
}
