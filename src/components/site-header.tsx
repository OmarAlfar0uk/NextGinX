"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { Icon } from "@/components/icons";

const navItems = ["home", "about", "services", "industries", "work", "process", "insights", "contact"] as const;
const hrefs = ["", "/about", "/services", "/industries", "/work", "/process", "/insights", "/contact"];

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = copy(locale);
  const path = usePathname() ?? `/${locale}`;
  const [open, setOpen] = useState(false);
  const otherLocale = locale === "en" ? "ar" : "en";
  const switchedPath = path.replace(/^\/(en|ar)(?=\/|$)/, `/${otherLocale}`);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <header className="site-header">
    <div className="nav-shell wrap">
      <Link href={`/${locale}`} aria-label="NextGinX home" className="brand-mark" onClick={() => setOpen(false)}>
        <Image src="/NextGinX_Logo.png" alt="NextGinX — Build. Launch. Scale." width={750} height={180} priority />
      </Link>
      <button className="menu-toggle" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(!open)}>
        <Icon name={open ? "close" : "menu"} size={21} />
      </button>
      <nav id="primary-navigation" className={`nav-links ${open ? "is-open" : ""}`} aria-label="Primary navigation">
        {navItems.map((item, i) => <Link key={item} href={`/${locale}${hrefs[i]}`} aria-current={path === `/${locale}${hrefs[i]}` ? "page" : undefined} onClick={() => setOpen(false)}>{t.nav[item]}</Link>)}
        <div className="nav-actions">
          <Link className="language-switch" href={switchedPath} lang={otherLocale} onClick={() => setOpen(false)}>{t.nav.language}</Link>
          <Link className="button button-small button-primary" href={`/${locale}/contact`} onClick={() => setOpen(false)}>{t.nav.cta}<Icon name={locale === "ar" ? "arrowLeft" : "arrow"} size={16} /></Link>
        </div>
      </nav>
    </div>
  </header>;
}
