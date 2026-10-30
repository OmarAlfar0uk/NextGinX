import type { MetadataRoute } from "next";
import { company } from "@/data/company";
import { services } from "@/data/services";
import { projects } from "@/data/projects";
import { locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!company.website) return [];
  const pages = ["", "/about", "/services", "/industries", "/work", "/process", "/insights", "/contact", "/privacy", "/terms"];
  const routes = locales.flatMap((locale) => [
    ...pages.map((path) => ({ url: `${company.website}/${locale}${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.6 })),
    ...services.map((item) => ({ url: `${company.website}/${locale}/services/${item.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...projects.map((item) => ({ url: `${company.website}/${locale}/work/${item.slug}`, changeFrequency: "monthly" as const, priority: 0.4 })),
  ]);
  return routes;
}
