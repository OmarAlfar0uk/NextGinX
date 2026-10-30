import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { projects, categories, projectBySlug } from "@/data/projects";
import { copy, isLocale, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { ProjectVisual } from "@/components/project-visual";
import { Icon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";

export function generateStaticParams() { return locales.flatMap((locale) => projects.map((project) => ({ locale, slug: project.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; if (!isLocale(locale)) return {}; const project = projectBySlug(slug); if (!project) return {}; const index = locale === "ar" ? 1 : 0; return pageMetadata(locale, `/work/${slug}`, project.title[index], project.summary[index]); }
export default async function CaseStudyPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: value, slug } = await params; if (!isLocale(value)) notFound(); const project = projectBySlug(slug); if (!project) notFound(); const index = value === "ar" ? 1 : 0, t = copy(value); const category = categories.find((item) => item.id === project.category)?.label[index];
  return <><section className="case-hero wrap"><Link href={`/${value}/work`} className="back-link"><Icon name={value === "ar" ? "arrowRight" : "arrowLeft"} size={16} />{t.common.back}</Link><div className="case-title"><div><span className="eyebrow eyebrow-dark"><i />{category}</span><h1>{project.title[index]}</h1><p>{project.summary[index]}</p></div><span className="concept-tag concept-tag-large">{t.common.concept}</span></div><ProjectVisual project={project} /></section>
    <section className="case-content section-pad"><div className="wrap case-columns"><div className="case-main"><article><span className="eyebrow eyebrow-dark"><i />01 / {t.work.challenge}</span><p>{project.challenge[index]}</p></article><article><span className="eyebrow eyebrow-dark"><i />02 / {t.work.solution}</span><p>{project.solution[index]}</p></article><article><span className="eyebrow eyebrow-dark"><i />03 / {t.work.features}</span><ul className="check-list">{project.features[index].map((feature) => <li key={feature}><Check size={17} />{feature}</li>)}</ul></article><article><span className="eyebrow eyebrow-dark"><i />04 / {t.work.results}</span><p>{t.work.resultsText}</p></article></div><aside className="case-aside"><span className="eyebrow eyebrow-dark"><i />{t.work.stack}</span><div className="technology-tags">{project.stack.map((item) => <span key={item}>{item}</span>)}</div><p>{t.common.example}</p><Link className="button button-primary" href={`/${value}/contact`}>{t.common.discuss}<Icon name={value === "ar" ? "arrowLeft" : "arrow"} size={17} /></Link></aside></div></section><CtaBand locale={value} /></>;
}
