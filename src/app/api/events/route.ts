import { NextResponse } from "next/server";

const events: Array<{ titleId: number; type: string; at: string }> = [];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!Number.isInteger(body.titleId) || !["play", "complete", "like", "skip"].includes(body.type)) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  events.push({ titleId: body.titleId, type: body.type, at: new Date().toISOString() });
  if (events.length > 1000) events.shift();
  return NextResponse.json({ ok: true });
}
