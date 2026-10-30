import Link from "next/link";
import { Icon } from "@/components/icons";
import type { Service } from "@/data/services";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
export function ServiceCard({ service, locale }: { service: Service; locale: Locale }) {
  const index = locale === "ar" ? 1 : 0;
  const t = copy(locale);
  return <Link href={`/${locale}/services/${service.slug}`} className="service-card">
    <span className="service-icon"><Icon name={service.icon as never} size={22} /></span><h3>{service.title[index]}</h3><p>{service.short[index]}</p><span className="text-link">{t.common.learn}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={16} /></span>
  </Link>;
}
