import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { company } from "@/data/company";
import { services } from "@/data/services";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const rtl = value === "ar";
  const schema = { "@context": "https://schema.org", "@type": "Organization", name: company.name, description: company.description, ...(company.website ? { url: company.website, logo: `${company.website}/NextGinX_Logo.png` } : {}), knowsAbout: services.map((service) => service.title[0]) };
  return <div className={`site-shell ${rtl ? "rtl" : "ltr"}`} dir={rtl ? "rtl" : "ltr"} lang={value}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <a className="skip-link" href="#main-content">{rtl ? "انتقل إلى المحتوى" : "Skip to content"}</a>
    <SiteHeader locale={value} />
    <main id="main-content">{children}</main>
    <SiteFooter locale={value} />
  </div>;
}
