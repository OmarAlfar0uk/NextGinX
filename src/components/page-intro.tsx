import type { ReactNode } from "react";
export function PageIntro({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children?: ReactNode }) {
  return <section className="page-intro wrap"><span className="eyebrow"><i />{eyebrow}</span><h1>{title}</h1>{text && <p>{text}</p>}{children}</section>;
}
