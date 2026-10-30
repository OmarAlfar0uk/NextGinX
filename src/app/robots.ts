import type { MetadataRoute } from "next";
import { company } from "@/data/company";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, ...(company.website ? { sitemap: `${company.website}/sitemap.xml` } : {}) };
}
