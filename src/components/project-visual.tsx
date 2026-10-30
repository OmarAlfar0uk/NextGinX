import { Icon } from "@/components/icons";
import type { Project } from "@/data/projects";
export function ProjectVisual({ project, compact = false }: { project: Project; compact?: boolean }) {
  return <div className={`project-visual visual-${project.visual} accent-${project.accent} ${compact ? "is-compact" : ""}`} aria-label={`${project.title[0]} product concept preview`} role="img">
    <div className="mock-window"><div className="mock-sidebar"><span className="mock-logo"><i /></span><i /><i /><i /><i /></div><div className="mock-main"><div className="mock-top"><span className="mock-search" /><span className="mock-avatar" /></div><div className="mock-titleline" /><div className="mock-subline" /><div className="mock-stats"><i /><i /><i /></div><div className="mock-content"><div className="mock-chart"><div className="chart-grid"><i /><i /><i /></div><svg viewBox="0 0 300 95" preserveAspectRatio="none" aria-hidden="true"><path d="M0 76 C25 68 29 45 58 54 S94 70 122 43 158 57 181 31 218 51 244 21 275 31 300 8" /></svg></div><div className="mock-list"><i /><i /><i /><i /></div></div></div></div>
    <div className="visual-caption"><span className="caption-dot" /><span>Product concept</span><Icon name="arrow" size={15} /></div>
  </div>;
}
