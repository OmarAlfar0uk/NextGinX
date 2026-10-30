"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { categories, projects } from "@/data/projects";
import { ProjectCard } from "@/components/project-card";

export function PortfolioGrid({ locale }: { locale: Locale }) {
  const [filter, setFilter] = useState("all");
  const t = copy(locale);
  const visible = useMemo(() => filter === "all" ? projects : projects.filter((project) => project.category === filter), [filter]);
  return <div className="portfolio-browser">
    <div className="filter-row" role="group" aria-label={locale === "ar" ? "تصفية حسب الفئة" : "Filter projects by category"}>
      <button type="button" className={filter === "all" ? "active" : ""} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{t.common.all}</button>
      {categories.map((category) => <button key={category.id} type="button" className={filter === category.id ? "active" : ""} aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>{category.label[locale === "ar" ? 1 : 0]}</button>)}
    </div>
    {visible.length ? <div className="project-grid">{visible.map((project) => <ProjectCard key={project.slug} project={project} locale={locale} />)}</div> : <p className="empty-filter">{t.common.noResults}</p>}
  </div>;
}
