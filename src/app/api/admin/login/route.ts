import { NextResponse } from "next/server";
import { z } from "zod";
import argon2 from "argon2";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";
const schema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) });
const attempts = new Map<string, { count: number; since: number }>();
export async function POST(request: Request) {
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const current = attempts.get(ip); const now = Date.now();
  if (current && now - current.since < 15 * 60_000 && current.count >= 8) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  let raw: unknown; try { raw = await request.json(); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }
  const parsed = schema.safeParse(raw); if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const email = parsed.data.email.toLowerCase().trim();
  const user = await db.adminUser.findUnique({ where: { email } });
  const valid = user?.active ? await argon2.verify(user.passwordHash, parsed.data.password).catch(() => false) : false;
  if (!user || !valid) { attempts.set(ip, current && now - current.since < 15 * 60_000 ? { count: current.count + 1, since: current.since } : { count: 1, since: now }); return NextResponse.json({ error: "invalid_credentials" }, { status: 401 }); }
  attempts.delete(ip);
  await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, role: user.role } }, { headers: { "Cache-Control": "no-store" } });
}
