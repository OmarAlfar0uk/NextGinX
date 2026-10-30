import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, Check, Layers3, MoveUpRight, Sparkles } from "lucide-react";
import { services } from "@/data/services";
import { projects } from "@/data/projects";
import { processSteps } from "@/data/process";
import { copy, isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { ServiceCard } from "@/components/service-card";
import { ProjectCard } from "@/components/project-card";
import { Icon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";
import { ContentType, PublishStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getPublishedHero(locale: "en" | "ar") {
  const entry = await db.contentEntry.findFirst({ where: { type: ContentType.HOME, locale, slug: "home", status: PublishStatus.PUBLISHED }, select: { title: true, summary: true } });
  return { title: entry?.title || null, summary: entry?.summary || null };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: value } = await params; if (!isLocale(value)) return {};
  const t = copy(value);
  const hero = await getPublishedHero(value);
  return pageMetadata(value, "", hero.title || t.home.title, hero.summary || t.home.intro);
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params; if (!isLocale(value)) notFound();
  const locale = value, index = locale === "ar" ? 1 : 0, t = copy(locale);
  const hero = await getPublishedHero(locale);
  return <>
    <section className="hero-section">
      <div className="hero-glow hero-glow-purple" /><div className="hero-glow hero-glow-cyan" />
      <div className="hero-layout wrap">
        <div className="hero-copy"><span className="eyebrow"><i />{t.home.eyebrow}</span><h1>{hero.title || t.home.title}</h1><p>{hero.summary || t.home.intro}</p><div className="hero-actions"><Link href={`/${locale}/contact`} className="button button-primary">{t.home.primary}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={17} /></Link><Link href={`/${locale}/work`} className="button button-outline">{t.home.secondary}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={17} /></Link></div><div className="hero-proof"><span className="proof-symbol"><Icon name="check" size={15} /></span><span>{t.home.strengths[0]}</span><span className="proof-divider" /><span>{t.home.strengths[1]}</span></div></div>
        <div className="hero-art" aria-label="Abstract preview of a digital product dashboard" role="img"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-orbit orbit-three" /><div className="hero-core"><span className="core-mark"><i /><b /></span><strong>NextGinX</strong><small>{t.home.visual}</small></div><div className="hero-float float-top"><span><Sparkles size={16} /></span><div><b>{t.home.visual}</b><small>{t.home.visualSub}</small></div></div><div className="hero-float float-bottom"><span className="float-bars"><i /><i /><i /><i /></span><div><b>{locale === "ar" ? "من الفكرة إلى المنتج" : "From idea to product"}</b><small>{locale === "ar" ? "وضوح في كل خطوة" : "Clarity at every step"}</small></div><MoveUpRight size={17} /></div><div className="hero-spark spark-one" /><div className="hero-spark spark-two" /></div>
      </div><div className="hero-bottom wrap"><span>{locale === "ar" ? "منتجات رقمية ذات أساس متين" : "Digital products with solid foundations"}</span><ArrowDown size={17} /><span>{locale === "ar" ? "مصممة للنمو" : "Designed to grow"}</span></div>
    </section>

    <section className="trust-section section-pad"><div className="wrap trust-layout"><div><span className="eyebrow eyebrow-dark"><i />{locale === "ar" ? "ما يميزنا" : "The NextGinX approach"}</span><h2>{t.home.trustTitle}</h2><p>{t.home.trustIntro}</p></div><div className="trust-list">{t.home.strengths.map((item, i) => <div className="trust-item" key={item}><span className="trust-count">0{i + 1}</span><span>{item}</span><Check size={17} /></div>)}</div></div></section>

    <section className="services-section section-pad"><div className="wrap"><div className="section-heading"><div><span className="eyebrow eyebrow-dark"><i />{t.home.servicesEyebrow}</span><h2>{t.home.servicesTitle}</h2></div><div className="heading-aside"><p>{t.home.servicesIntro}</p><Link className="text-link" href={`/${locale}/services`}>{locale === "ar" ? "كل الخدمات" : "All services"}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={16} /></Link></div></div><div className="service-grid">{services.map((service) => <ServiceCard key={service.slug} service={service} locale={locale} />)}</div></div></section>

    <section className="work-section section-pad"><div className="wrap"><div className="section-heading"><div><span className="eyebrow"><i />{t.home.workEyebrow}</span><h2>{t.home.workTitle}</h2></div><div className="heading-aside"><p>{t.home.workIntro}</p><Link className="text-link light-link" href={`/${locale}/work`}>{t.nav.work}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={16} /></Link></div></div><div className="project-grid home-project-grid">{projects.slice(0, 3).map((project) => <ProjectCard key={project.slug} project={project} locale={locale} />)}</div></div></section>

    <section className="why-section section-pad"><div className="wrap why-layout"><div className="why-lead"><span className="eyebrow eyebrow-dark"><i />{t.home.whyEyebrow}</span><h2>{t.home.whyTitle}</h2><p>{t.home.whyIntro}</p><Link className="text-link" href={`/${locale}/about`}>{t.nav.about}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={16} /></Link><div className="why-orbit"><div className="why-orbit-ring" /><div className="why-orbit-center"><span><i /><b /></span></div><span className="orbit-chip chip-one"><Layers3 size={18} /></span><span className="orbit-chip chip-two"><Sparkles size={17} /></span></div></div><div className="why-points">{t.home.why.map((item, i) => <article className="why-point" key={item}><span className="why-num">0{i + 1}</span><div><h3>{item}</h3><p>{t.home.whyText[i]}</p></div><Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={19} /></article>)}</div></div></section>

    <section className="process-section section-pad"><div className="wrap"><div className="section-heading"><div><span className="eyebrow eyebrow-dark"><i />{t.home.processEyebrow}</span><h2>{t.home.processTitle}</h2></div><div className="heading-aside"><p>{t.home.processIntro}</p><Link className="text-link" href={`/${locale}/process`}>{t.common.read}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={16} /></Link></div></div><div className="process-track">{processSteps.slice(0, 7).map((step, i) => <Link className="process-node" key={step.title[0]} href={`/${locale}/process`}><span className="process-dot"><span>{String(i + 1).padStart(2, "0")}</span></span><span className="process-title">{step.title[index]}</span><span className="process-arrow"><ArrowDown size={14} /></span></Link>)}</div></div></section>

    <section className="engagement-section section-pad"><div className="wrap"><div className="section-heading"><div><span className="eyebrow"><i />{t.home.engagementEyebrow}</span><h2>{t.home.engagementTitle}</h2></div></div><div className="engagement-grid">{t.home.engagement.map((item, i) => <article key={item} className="engagement-card"><span className="engagement-index">0{i + 1}</span><h3>{item}</h3><p>{t.home.engagementText[i]}</p><Link className="text-link light-link" href={`/${locale}/contact`}>{t.common.discuss}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={16} /></Link></article>)}</div></div></section>
    <CtaBand locale={locale} />
  </>;
}
