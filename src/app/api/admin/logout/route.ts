import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/auth/session";
export async function POST(request: Request) {
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await revokeSession(); return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
