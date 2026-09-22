export type CatalogTitle = {
  id: number;
  name: string;
  description: string;
  category: "Movies" | "Series" | "Live";
  meta: string;
  accent: string;
  language: string;
  genres: string[];
  mood: string[];
  actors: string[];
  durationMinutes?: number;
  tags: string[];
  song?: string;
};

export const catalog: CatalogTitle[] = [
  { id: 1, name: "The Last Horizon", description: "When the final city goes dark, one radio signal gives a crew of strangers a reason to cross the wasteland.", category: "Movies", meta: "2h 08m • 4K • 2025", accent: "sunset", language: "English", genres: ["Drama", "Adventure"], mood: ["gripping", "hopeful"], actors: ["Maya Chen", "Arjun Rao"], durationMinutes: 128, tags: ["yupp original", "cinema"], song: "Horizon Lights" },
  { id: 2, name: "Monsoon Files", description: "A reporter returns to the coast to uncover the stories hidden beneath a changing shoreline.", category: "Series", meta: "S1 • 8 episodes • 2024", accent: "ocean", language: "English", genres: ["Drama", "Mystery"], mood: ["thoughtful", "tense"], actors: ["Nisha Kapoor"], tags: ["top 10", "investigation"] },
  { id: 3, name: "Chennai Super Kings", description: "Live coverage, analysis, and every boundary from the biggest nights in cricket.", category: "Live", meta: "Live now • Sports", accent: "gold", language: "Tamil", genres: ["Sports"], mood: ["energetic"], actors: [], tags: ["live", "cricket"] },
  { id: 4, name: "Between Two Worlds", description: "Two families. One old secret. A new generation refuses to keep it buried.", category: "Movies", meta: "1h 52m • 5.1 • 2023", accent: "violet", language: "Hindi", genres: ["Family", "Drama"], mood: ["warm", "emotional"], actors: ["Ravi Menon", "Sara Ali"], durationMinutes: 112, tags: ["family", "award winner"] },
  { id: 5, name: "Midnight Diner", description: "Every dish has a story, and every story arrives after midnight.", category: "Series", meta: "S2 • 10 episodes • 2025", accent: "ember", language: "Japanese", genres: ["Food", "Drama"], mood: ["comforting", "warm"], actors: ["Ken Watanabe"], tags: ["new", "food"] },
  { id: 6, name: "World News 24", description: "The headlines that matter, with context from the people living them.", category: "Live", meta: "Live now • News", accent: "sky", language: "English", genres: ["News"], mood: ["informative"], actors: [], tags: ["live", "news"] },
  { id: 7, name: "The Long Way Home", description: "A road trip becomes a reckoning when an estranged brother joins the ride.", category: "Movies", meta: "2h 01m • 4K • 2024", accent: "forest", language: "English", genres: ["Family", "Adventure"], mood: ["uplifting", "fun"], actors: ["Daniel Brooks"], durationMinutes: 121, tags: ["family", "road trip"], song: "Homeward" },
  { id: 8, name: "Kitchen Stories", description: "Home cooks from across India share the recipes that shaped their lives.", category: "Series", meta: "S1 • 6 episodes • 2025", accent: "rose", language: "Hindi", genres: ["Food", "Documentary"], mood: ["inspiring", "comforting"], actors: ["Asha Rao"], tags: ["new", "food"] },
];

export function searchCatalog(query: string) {
  const normalized = query.toLowerCase().trim();
  const duration = normalized.match(/(?:under|less than|below)\s+(\d+)\s*(?:minutes|min|hours|hour|h)/);
  const maxMinutes = duration ? (duration[0].includes("hour") || duration[0].includes("hours") || duration[0].includes(" h") ? Number(duration[1]) * 60 : Number(duration[1])) : undefined;
  const terms = normalized.split(/[^a-z0-9]+/).filter((term) => term.length > 2 && !["find", "show", "movie", "movies", "watch", "want"].includes(term));
  return catalog.filter((title) => {
    const text = [title.name, title.description, title.category, title.language, ...title.genres, ...title.mood, ...title.actors, ...title.tags].join(" ").toLowerCase();
    return (!terms.length || terms.some((term) => text.includes(term))) && (!maxMinutes || (title.durationMinutes !== undefined && title.durationMinutes <= maxMinutes));
  });
}

export function getTitle(id: number) {
  return catalog.find((title) => title.id === id);
}
