import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { copy, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { industries } from "@/data/industries";
import { Icon, type IconName } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";
import { PageIntro } from "@/components/page-intro";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; const t = copy(locale); return pageMetadata(locale, "/industries", t.nav.industries, t.industries.intro); }
export default async function IndustriesPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: value } = await params; if (!isLocale(value)) notFound(); const index = value === "ar" ? 1 : 0, t = copy(value);
  return <><PageIntro eyebrow={t.industries.eyebrow} title={t.industries.title} text={t.industries.intro}><p className="page-note">{t.industries.note}</p></PageIntro><section className="industries-section section-pad"><div className="wrap industries-grid">{industries.map((industry, i) => <article className="industry-card" key={industry.title[0]}><div className="industry-card-top"><span className="industry-icon"><Icon name={industry.icon as IconName} size={23} /></span><span className="industry-index">0{i + 1}</span></div><h2>{industry.title[index]}</h2><div className="industry-text"><b>{t.industries.problem}</b><p>{industry.problem[index]}</p></div><div className="industry-text"><b>{t.industries.solution}</b><p>{industry.solution[index]}</p></div></article>)}</div></section><CtaBand locale={value} /></>;
}
