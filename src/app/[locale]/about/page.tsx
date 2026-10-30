import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { copy, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { CtaBand } from "@/components/cta-band";
import { PageIntro } from "@/components/page-intro";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; const t = copy(locale); return pageMetadata(locale, "/about", t.nav.about, t.about.intro); }
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params; if (!isLocale(value)) notFound(); const t = copy(value);
  return <><PageIntro eyebrow={t.about.eyebrow} title={t.about.title} text={t.about.intro} />
    <section className="about-mission section-pad"><div className="wrap mission-grid"><article className="mission-card mission-primary"><span className="mission-mark">01</span><h2>{t.about.mission}</h2><p>{t.about.missionText}</p></article><article className="mission-card"><span className="mission-mark">02</span><h2>{t.about.vision}</h2><p>{t.about.visionText}</p></article></div></section>
    <section className="values-section section-pad"><div className="wrap"><div className="section-heading"><div><span className="eyebrow eyebrow-dark"><i />{value === "ar" ? "مبادئنا" : "What guides us"}</span><h2>{t.about.valuesTitle}</h2></div></div><div className="values-grid">{t.about.values.map((item, i) => <article key={item}><span>0{i + 1}</span><h3>{item}</h3><Check size={18} /></article>)}</div></div></section>
    <section className="approach-section section-pad"><div className="wrap approach-layout"><div><span className="eyebrow"><i />{value === "ar" ? "منهجيتنا" : "Our approach"}</span><h2>{t.about.approachTitle}</h2><p>{t.about.approachText}</p></div><div className="capability-card"><span className="eyebrow eyebrow-dark"><i />{value === "ar" ? "خبرات الفريق" : "Team capabilities"}</span><h3>{t.about.capabilitiesTitle}</h3>{t.about.capabilities.map((item, i) => <div key={item} className="capability-row"><span>0{i + 1}</span><span>{item}</span><Check size={16} /></div>)}</div></div></section>
    <CtaBand locale={value} /></>;
}
