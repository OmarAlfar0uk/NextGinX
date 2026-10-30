import { ContentType, PublishStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";
const localeSchema = z.enum(["en", "ar"]);
const draftSchema = z.object({ locale: localeSchema, title: z.string().trim().min(1).max(240), summary: z.string().trim().max(1000) });
const publishSchema = z.object({ locale: localeSchema });

async function authorize() {
  const user = await getSession();
  if (!user) return { response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) } as const;
  if (!can(user.role, "content:write")) return { response: NextResponse.json({ error: "forbidden" }, { status: 403 }) } as const;
  return { user } as const;
}

export async function GET(request: Request) {
  const auth = await authorize(); if ("response" in auth) return auth.response;
  const locale = localeSchema.safeParse(new URL(request.url).searchParams.get("locale"));
  if (!locale.success) return NextResponse.json({ error: "invalid_locale" }, { status: 400 });
  const [draft, published] = await Promise.all([
    db.contentEntry.findUnique({ where: { type_locale_slug: { type: ContentType.HOME, locale: locale.data, slug: "home-draft" } }, select: { id: true, title: true, summary: true, status: true, updatedAt: true } }),
    db.contentEntry.findUnique({ where: { type_locale_slug: { type: ContentType.HOME, locale: locale.data, slug: "home" } }, select: { title: true, summary: true, status: true, updatedAt: true } }),
  ]);
  return NextResponse.json({ draft, published }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  const auth = await authorize(); if ("response" in auth) return auth.response;
  const parsed = draftSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { locale, title, summary } = parsed.data;
  const draft = await db.contentEntry.upsert({
    where: { type_locale_slug: { type: ContentType.HOME, locale, slug: "home-draft" } },
    create: { type: ContentType.HOME, locale, slug: "home-draft", title, summary: summary || null, content: {}, status: PublishStatus.DRAFT, authorId: auth.user.id },
    update: { title, summary: summary || null, content: {}, status: PublishStatus.DRAFT, authorId: auth.user.id },
    select: { id: true, title: true, summary: true, status: true, updatedAt: true },
  });
  await db.auditEvent.create({ data: { actorId: auth.user.id, action: "content.home_draft_saved", target: "home:" + locale } });
  return NextResponse.json({ draft }, { status: 200, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const auth = await authorize(); if ("response" in auth) return auth.response;
  const parsed = publishSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { locale } = parsed.data;
  const draft = await db.contentEntry.findUnique({ where: { type_locale_slug: { type: ContentType.HOME, locale, slug: "home-draft" } } });
  if (!draft) return NextResponse.json({ error: "draft_not_found" }, { status: 404 });
  await db.$transaction(async (tx) => {
    await tx.contentEntry.upsert({
      where: { type_locale_slug: { type: ContentType.HOME, locale, slug: "home" } },
      create: { type: ContentType.HOME, locale, slug: "home", title: draft.title, summary: draft.summary, content: draft.content ?? {}, seo: draft.seo ?? undefined, status: PublishStatus.PUBLISHED, publishedAt: new Date(), authorId: auth.user.id },
      update: { title: draft.title, summary: draft.summary, content: draft.content ?? {}, seo: draft.seo ?? undefined, status: PublishStatus.PUBLISHED, publishedAt: new Date(), authorId: auth.user.id },
    });
    await tx.contentEntry.delete({ where: { id: draft.id } });
    await tx.auditEvent.create({ data: { actorId: auth.user.id, action: "content.home_published", target: "home:" + locale } });
  });
  revalidatePath("/" + locale, "page");
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
