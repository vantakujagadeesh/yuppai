import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const watched = Array.isArray(body.watchedIds) ? body.watchedIds.filter((id: unknown): id is number => typeof id === "number") : [];
  const preferences = body.preferences && typeof body.preferences === "object" ? body.preferences as { language?: string; genre?: string; mood?: string } : {};
  const scored = catalog.filter((title) => !watched.includes(title.id)).map((title) => {
    let score = title.tags.includes("new") ? 1 : 0;
    if (preferences.language && title.language.toLowerCase() === preferences.language.toLowerCase()) score += 3;
    if (preferences.genre && title.genres.some((genre) => genre.toLowerCase() === preferences.genre?.toLowerCase())) score += 3;
    if (preferences.mood && title.mood.some((mood) => mood.toLowerCase() === preferences.mood?.toLowerCase())) score += 2;
    return { title, score };
  }).sort((a, b) => b.score - a.score).slice(0, 4);
  return NextResponse.json({ items: scored.map(({ title }) => title), reason: watched.length ? "Based on your watch history and taste profile" : "Popular on Yupp TV", explanation: preferences.language ? `Matched to ${preferences.language}${preferences.genre ? ` ${preferences.genre}` : ""} preferences.` : "Set a language, genre, or mood to make recommendations more personal." });
}
