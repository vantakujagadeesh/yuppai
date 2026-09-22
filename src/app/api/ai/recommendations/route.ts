import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const watched = Array.isArray(body.watchedIds) ? body.watchedIds.filter((id: unknown): id is number => typeof id === "number") : [];
  const items = catalog.filter((title) => !watched.includes(title.id)).sort((a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new"))).slice(0, 4);
  return NextResponse.json({ items, reason: watched.length ? "Based on what you watched recently" : "Popular on Yupp TV" });
}
