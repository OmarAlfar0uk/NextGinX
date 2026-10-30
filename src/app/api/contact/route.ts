import { NextResponse } from "next/server";
import { OutboxStatus } from "@prisma/client";
import { db } from "@/lib/db";

type ContactBody = Record<string, unknown>;
const attempts = new Map<string, { count: number; reset: number }>();
const limits = { name: 120, company: 160, email: 254, phone: 40, country: 80, service: 100, budget: 100, preferred: 50, description: 3000, website: 300 };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const services = ["Website development", "Custom software", "SaaS development", "UI/UX design", "Cloud & DevOps", "API integration", "Maintenance & support", "E-commerce development", "Other", "تطوير المواقع", "برمجيات مخصصة", "تطوير SaaS", "تصميم تجربة وواجهة المستخدم", "الحوسبة السحابية وDevOps", "تكامل API", "الصيانة والدعم", "تطوير التجارة الإلكترونية", "أخرى"];

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 20_000) return NextResponse.json({ error: "invalid" }, { status: 413 });
    body = await request.json() as ContactBody;
  } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }

  const data = Object.fromEntries(Object.entries(limits).map(([key, max]) => [key, clean(body[key], max)]));
  if (JSON.stringify(body).length > 20_000) return NextResponse.json({ error: "invalid" }, { status: 413 });
  if (data.website) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const name = data.name as string, email = data.email as string, service = data.service as string, description = data.description as string;
  if (!name || !emailPattern.test(email) || !services.includes(service) || description.length < 10) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || "unknown";
  const now = Date.now();
  const current = attempts.get(key);
  if (current && now < current.reset && current.count >= 5) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  attempts.set(key, current && now < current.reset ? { count: current.count + 1, reset: current.reset } : { count: 1, reset: now + 60 * 60 * 1000 });

  const to = process.env.CONTACT_TO_EMAIL;
  const lines = [
    `Name: ${data.name}`, `Company: ${data.company || "—"}`, `Email: ${data.email}`,
    `Phone / WhatsApp: ${data.phone || "—"}`, `Country: ${data.country || "—"}`, `Service: ${data.service}`,
    `Estimated budget: ${data.budget || "—"}`, `Preferred contact: ${data.preferred || "—"}`, "", "Project description:", data.description as string,
  ];
  const lead = await db.$transaction(async (tx) => {
    const created = await tx.lead.create({ data: { name, email: email.toLowerCase(), company: data.company || null, phone: data.phone || null, country: data.country || null, service, budget: data.budget || null, description, preferredContact: data.preferred || null, sourcePage: safeRefererPath(request.headers.get("referer")) } });
    await tx.leadEvent.create({ data: { leadId: created.id, action: "lead.created", metadata: { source: "website_contact_form" } } });
    await tx.emailOutbox.create({ data: { leadId: created.id, recipient: to || "", subject: `New NextGinX project enquiry — ${service}`, body: lines.join("\n"), status: to ? OutboxStatus.PENDING : OutboxStatus.FAILED, lastError: to ? null : "Notification recipient is not configured" } });
    return created;
  });
  return NextResponse.json({ ok: true, id: lead.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

function safeRefererPath(value: string | null) { if (!value) return null; try { return new URL(value).pathname.slice(0, 300); } catch { return null; } }
