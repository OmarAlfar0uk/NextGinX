import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/data/services";
import { copy, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { ServiceCard } from "@/components/service-card";
import { CtaBand } from "@/components/cta-band";
import { PageIntro } from "@/components/page-intro";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) return {}; const t = copy(locale); return pageMetadata(locale, "/services", t.nav.services, t.services.intro); }
export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) { const { locale: value } = await params; if (!isLocale(value)) notFound(); const t = copy(value);
  return <><PageIntro eyebrow={t.services.eyebrow} title={t.services.title} text={t.services.intro} /><section className="services-section section-pad"><div className="wrap"><div className="service-grid service-grid-page">{services.map((service) => <ServiceCard key={service.slug} service={service} locale={value} />)}</div></div></section><CtaBand locale={value} /></>;
}
