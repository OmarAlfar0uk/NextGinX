import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { Icon } from "@/components/icons";
export function CtaBand({ locale }: { locale: Locale }) {
  const t = copy(locale);
  return <section className="cta-band wrap"><div className="cta-glow" /><span className="eyebrow">{t.home.eyebrow}</span><h2>{t.home.finalTitle}</h2><p>{t.home.finalText}</p><Link className="button button-light" href={`/${locale}/contact`}>{t.common.discuss}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={17} /></Link></section>;
}
