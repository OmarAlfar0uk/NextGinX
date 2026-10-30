import Image from "next/image";
import Link from "next/link";
import { company } from "@/data/company";
import { services } from "@/data/services";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { Icon } from "@/components/icons";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const index = locale === "ar" ? 1 : 0;
  const mainLinks = [["about", t.nav.about], ["services", t.nav.services], ["industries", t.nav.industries], ["work", t.nav.work], ["process", t.nav.process], ["insights", t.nav.insights]];
  const socials = [[company.linkedin, "LinkedIn"], [company.facebook, "Facebook"], [company.instagram, "Instagram"]].filter(([url]) => url);
  return <footer className="site-footer">
    <div className="footer-top wrap">
      <div className="footer-brand"><Link href={`/${locale}`}><Image src="/NextGinX_Logo.png" width={750} height={180} alt="NextGinX — Build. Launch. Scale." /></Link><p>{t.footer.blurb}</p></div>
      <div className="footer-col"><h3>{t.footer.explore}</h3>{mainLinks.map(([path, label]) => <Link key={path} href={`/${locale}/${path}`}>{label}</Link>)}</div>
      <div className="footer-col"><h3>{t.footer.services}</h3>{services.slice(0, 5).map((service) => <Link key={service.slug} href={`/${locale}/services/${service.slug}`}>{service.title[index]}</Link>)}</div>
      <div className="footer-col footer-contact"><h3>{t.footer.connect}</h3><p>{t.footer.contact}</p>{company.email && <a href={`mailto:${company.email}`}>{company.email}</a>}{company.whatsapp && <a href={company.whatsapp} target="_blank" rel="noreferrer">WhatsApp <Icon name="arrow" size={14} /></a>}{socials.map(([url, label]) => <a key={label} href={url} target="_blank" rel="noreferrer">{label} <Icon name="arrow" size={14} /></a>)}</div>
    </div>
    <div className="footer-bottom wrap"><span>© {new Date().getFullYear()} NextGinX. {t.footer.rights}</span><div><Link href={`/${locale}/privacy`}>{t.footer.privacy}</Link><Link href={`/${locale}/terms`}>{t.footer.terms}</Link></div><span>{company.tagline}</span></div>
  </footer>;
}
