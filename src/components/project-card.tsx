import Link from "next/link";
import type { Project } from "@/data/projects";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { ProjectVisual } from "@/components/project-visual";
import { Icon } from "@/components/icons";
import { categories } from "@/data/projects";
export function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const index = locale === "ar" ? 1 : 0;
  const t = copy(locale);
  const category = categories.find((item) => item.id === project.category)?.label[index];
  return <article className="project-card"><Link className="project-card-link" href={`/${locale}/work/${project.slug}`} aria-label={`${t.common.view}: ${project.title[index]}`}><ProjectVisual project={project} compact /><div className="project-card-copy"><div className="project-meta"><span>{category}</span><span className="concept-tag">{t.common.concept}</span></div><h3>{project.title[index]}</h3><p>{project.summary[index]}</p><span className="text-link">{t.common.view}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={16} /></span></div></Link></article>;
}
