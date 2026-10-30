import type { Metadata } from "next";
import { company } from "@/data/company";
import type { Locale } from "@/lib/i18n";

export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const url = company.website ? `${company.website}/${locale}${path}` : undefined;
  return {
    title: `${title} | NextGinX`,
    description,
    alternates: url ? { canonical: url, languages: { en: `${company.website}/en${path}`, ar: `${company.website}/ar${path}` } } : undefined,
    openGraph: { type: "website", siteName: "NextGinX", title: `${title} | NextGinX`, description, url, locale: locale === "ar" ? "ar_EG" : "en_US" },
    twitter: { card: "summary_large_image", title: `${title} | NextGinX`, description },
  };
}
