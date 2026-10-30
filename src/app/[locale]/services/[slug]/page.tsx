import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { copy, isLocale, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { Icon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";

export function generateStaticParams() { return locales.flatMap((locale) => services.map((service) => ({ locale, slug: service.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; if (!isLocale(locale)) return {}; const service = services.find((item) => item.slug === slug); if (!service) return {}; const index = locale === "ar" ? 1 : 0; return pageMetadata(locale, `/services/${slug}`, service.title[index], service.intro[index]); }
export default async function ServiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: value, slug } = await params; if (!isLocale(value)) notFound(); const service = services.find((item) => item.slug === slug); if (!service) notFound();
  const index = value === "ar" ? 1 : 0, t = copy(value);
  return <><section className="detail-hero wrap"><div className="detail-copy"><span className="eyebrow eyebrow-dark"><i />{t.services.detailLabel}</span><h1>{service.title[index]}</h1><p className="detail-lead">{service.intro[index]}</p><Link className="button button-primary" href={`/${value}/contact?service=${slug}`}>{t.common.start}<Icon name={value === "ar" ? "arrowLeft" : "arrow"} size={17} /></Link></div><div className="detail-symbol"><span><Icon name={service.icon as never} size={54} strokeWidth={1.25} /></span><i /><b /></div></section>
    <section className="service-detail-body section-pad"><div className="wrap service-detail-grid"><div><span className="eyebrow eyebrow-dark"><i />{value === "ar" ? "كيف نساعد" : "How we can help"}</span><h2>{t.services.detailTitle}</h2><p>{t.services.detailIntro}</p></div><div className="service-includes">{service.items[index].map((item, i) => <div key={item}><span>0{i + 1}</span><b>{item}</b><Check size={18} /></div>)}</div></div></section>
    <section className="related-services section-pad"><div className="wrap"><div className="section-heading"><div><span className="eyebrow eyebrow-dark"><i />{value === "ar" ? "خدمات مرتبطة" : "Related capabilities"}</span><h2>{value === "ar" ? "خبرات تكمل الصورة." : "Expertise that works together."}</h2></div><Link className="text-link" href={`/${value}/services`}>{t.nav.services}<Icon name={value === "ar" ? "arrowLeft" : "arrow"} size={16} /></Link></div><div className="related-links">{services.filter((item) => item.slug !== slug).slice(0, 3).map((item) => <Link href={`/${value}/services/${item.slug}`} key={item.slug}><span>{item.title[index]}</span><ArrowUpRight size={18} /></Link>)}</div></div></section><CtaBand locale={value} /></>;
}
