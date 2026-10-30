export const company = {
  name: "NextGinX",
  tagline: "Build. Launch. Scale.",
  description: "We turn ambitious ideas into reliable digital products through custom software, web applications, and SaaS platforms.",
  website: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
} as const;
