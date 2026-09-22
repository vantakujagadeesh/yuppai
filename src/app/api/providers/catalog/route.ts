import { NextResponse } from "next/server";
import { config } from "@/lib/config";

type TmdbMovie = { id: number; title?: string; overview?: string; release_date?: string; genre_ids?: number[]; original_language?: string };

const genres: Record<number, string> = { 18: "Drama", 35: "Comedy", 10751: "Family", 12: "Adventure", 9648: "Mystery", 28: "Action", 99: "Documentary" };

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length > 120) return NextResponse.json({ error: "A search query up to 120 characters is required" }, { status: 400 });
  if (!config.tmdbApiKey && !config.tmdbReadToken) return NextResponse.json({ error: "Catalog provider is not configured", provider: "tmdb" }, { status: 503 });
  const headers: HeadersInit = config.tmdbReadToken ? { Authorization: `Bearer ${config.tmdbReadToken}` } : {};
  const url = new URL("https://api.themoviedb.org/3/search/movie");
  url.searchParams.set("query", query);
  url.searchParams.set("language", "en-US");
  if (config.tmdbApiKey) url.searchParams.set("api_key", config.tmdbApiKey);
  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return NextResponse.json({ error: "Catalog provider request failed" }, { status: 502 });
    const data = (await response.json()) as { results?: TmdbMovie[] };
    return NextResponse.json({
      provider: "tmdb",
      items: (data.results ?? []).slice(0, 20).map((movie) => ({
        externalId: String(movie.id),
        title: movie.title ?? "Untitled",
        description: movie.overview ?? "No synopsis available.",
        year: movie.release_date?.slice(0, 4) ?? null,
        language: movie.original_language ?? null,
        genres: (movie.genre_ids ?? []).map((id) => genres[id]).filter(Boolean),
      })),
    });
  } catch (error) {
    console.error("catalog provider unavailable", error);
    return NextResponse.json({ error: "Catalog provider unavailable" }, { status: 503 });
  }
}
