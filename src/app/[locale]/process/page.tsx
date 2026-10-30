import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { copy, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { processSteps } from "@/data/process";
import { Icon } from "@/components/icons";
import { PageIntro } from "@/components/page-intro";
import { CtaBand } from "@/components/cta-band";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; const t = copy(locale); return pageMetadata(locale, "/process", t.nav.process, t.process.intro); }
export default async function ProcessPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: value } = await params; if (!isLocale(value)) notFound(); const index = value === "ar" ? 1 as const : 0 as const, t = copy(value);
  return <><PageIntro eyebrow={t.process.eyebrow} title={t.process.title} text={t.process.intro} /><section className="process-detail-section section-pad"><div className="wrap process-detail-list">{processSteps.map((step, i) => <article className="process-detail" key={step.title[0]}><div className="process-detail-marker"><span>{String(i + 1).padStart(2, "0")}</span><i /></div><div className="process-detail-copy"><span className="eyebrow eyebrow-dark"><i />{value === "ar" ? `المرحلة ${i + 1}` : `Stage ${String(i + 1).padStart(2, "0")}`}</span><h2>{step.title[index]}</h2><p>{step.text[index]}</p></div><div className="process-detail-side"><h3>{t.process.deliverables}</h3>{step.deliverables[index].map((item) => <p key={item}><Icon name="check" size={15} />{item}</p>)}<h3>{t.process.involvement}</h3>{step.role[index].map((item) => <p key={item}><Icon name="arrow" size={14} />{item}</p>)}</div></article>)}</div></section><CtaBand locale={value} /></>;
}
