import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { copy, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { PageIntro } from "@/components/page-intro";
import { CtaBand } from "@/components/cta-band";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; const t = copy(locale); return pageMetadata(locale, "/work", t.nav.work, t.work.intro); }
export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: value } = await params; if (!isLocale(value)) notFound(); const t = copy(value);
  return <><PageIntro eyebrow={t.work.eyebrow} title={t.work.title} text={t.work.intro}><p className="page-note">{t.work.note}</p></PageIntro><section className="work-list-section section-pad"><div className="wrap"><PortfolioGrid locale={value} /></div></section><CtaBand locale={value} /></>;
}
