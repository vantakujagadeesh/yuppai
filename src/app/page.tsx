"use client";

import { useEffect, useMemo, useState } from "react";

type Category = "All" | "Movies" | "Series" | "Live";

type Title = {
  id: number;
  name: string;
  description: string;
  category: Exclude<Category, "All">;
  meta: string;
  badge?: string;
  accent: string;
  video?: string;
};

const titles: Title[] = [
  {
    id: 1,
    name: "The Last Horizon",
    description:
      "When the final city goes dark, one radio signal gives a crew of strangers a reason to cross the wasteland.",
    category: "Movies",
    meta: "2h 08m • 4K • 2025",
    badge: "Yupp Premiere",
    accent: "sunset",
    video: "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  },
  {
    id: 2,
    name: "Monsoon Files",
    description:
      "A reporter returns to the coast to uncover the stories hidden beneath a changing shoreline.",
    category: "Series",
    meta: "S1 • 8 episodes • 2024",
    badge: "Top 10",
    accent: "ocean",
  },
  {
    id: 3,
    name: "Chennai Super Kings",
    description: "Live coverage, analysis, and every boundary from the biggest nights in cricket.",
    category: "Live",
    meta: "Live now • Sports",
    badge: "LIVE",
    accent: "gold",
  },
  {
    id: 4,
    name: "Between Two Worlds",
    description: "Two families. One old secret. A new generation refuses to keep it buried.",
    category: "Movies",
    meta: "1h 52m • 5.1 • 2023",
    accent: "violet",
  },
  {
    id: 5,
    name: "Midnight Diner",
    description: "Every dish has a story, and every story arrives after midnight.",
    category: "Series",
    meta: "S2 • 10 episodes • 2025",
    badge: "New",
    accent: "ember",
  },
  {
    id: 6,
    name: "World News 24",
    description: "The headlines that matter, with context from the people living them.",
    category: "Live",
    meta: "Live now • News",
    badge: "LIVE",
    accent: "sky",
  },
  {
    id: 7,
    name: "The Long Way Home",
    description: "A road trip becomes a reckoning when an estranged brother joins the ride.",
    category: "Movies",
    meta: "2h 01m • 4K • 2024",
    accent: "forest",
  },
  {
    id: 8,
    name: "Kitchen Stories",
    description: "Home cooks from across India share the recipes that shaped their lives.",
    category: "Series",
    meta: "S1 • 6 episodes • 2025",
    accent: "rose",
  },
];

const categories: Category[] = ["All", "Movies", "Series", "Live"];
const defaultProfile = { language: "English", genre: "Family", mood: "warm" };

function Icon({ children }: { children: React.ReactNode }) {
  return <span aria-hidden="true" className="icon">{children}</span>;
}

export default function Home() {
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [selected, setSelected] = useState<Title | null>(null);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi! Ask me to find a movie, series, channel, or song. Try “find a warm family movie under two hours.”" },
  ]);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [recommendations, setRecommendations] = useState<Title[]>([]);
  const [playbackError, setPlaybackError] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(defaultProfile);
  const [recommendationReason, setRecommendationReason] = useState("");
  const [continueWatching, setContinueWatching] = useState<Title[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("yupp-watchlist");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        window.setTimeout(() => setWatchlist(parsed), 0);
      } catch {
        window.localStorage.removeItem("yupp-watchlist");
      }
    }
  }, []);

  useEffect(() => {
    const watchedIds = JSON.parse(window.localStorage.getItem("yupp-watch-history") ?? "[]") as number[];
    const historyTitles = watchedIds.map((id) => titles.find((title) => title.id === id)).filter((title): title is Title => Boolean(title)).slice(0, 3);
    const savedProfile = window.localStorage.getItem("yupp-profile");
    const nextProfile = savedProfile ? JSON.parse(savedProfile) as typeof defaultProfile : defaultProfile;
    window.setTimeout(() => {
      setContinueWatching(historyTitles);
      setProfile(nextProfile);
    }, 0);
    fetch("/api/ai/recommendations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ watchedIds, preferences: nextProfile }) })
      .then((response) => response.json())
      .then((data: { items?: Title[]; explanation?: string }) => { setRecommendations(data.items ?? []); setRecommendationReason(data.explanation ?? ""); })
      .catch(() => setRecommendations([]));
  }, [watchlist]);

  const filteredTitles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return titles.filter((title) => {
      const matchesCategory = category === "All" || title.category === category;
      const matchesWatchlist = !showWatchlist || watchlist.includes(title.id);
      const matchesQuery =
        !normalizedQuery ||
        `${title.name} ${title.description} ${title.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesCategory && matchesWatchlist && matchesQuery;
    });
  }, [category, query, showWatchlist, watchlist]);

  function toggleWatchlist(id: number) {
    const next = watchlist.includes(id)
      ? watchlist.filter((item) => item !== id)
      : [...watchlist, id];
    setWatchlist(next);
    window.localStorage.setItem("yupp-watchlist", JSON.stringify(next));
  }

  async function askAssistant(event?: React.FormEvent) {
    event?.preventDefault();
    const content = assistantInput.trim();
    if (!content || assistantBusy) return;
    const next = [...assistantMessages, { role: "user" as const, content }];
    setAssistantMessages(next);
    setAssistantInput("");
    setAssistantBusy(true);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAssistantMessages([...next, { role: "assistant", content: `${result.answer}${result.source === "catalog-fallback" ? " (Catalog mode: connect a valid AI key for conversational answers.)" : ""}` }]);
      const firstMatch = titles.find((title) => result.titleIds?.includes(title.id));
      if (firstMatch) setSelected(firstMatch);
    } catch {
      setAssistantMessages([...next, { role: "assistant", content: "I couldn’t reach the assistant. You can still search the catalog above." }]);
    } finally {
      setAssistantBusy(false);
    }
  }

  function startVoiceSearch() {
    const SpeechRecognition = (window as Window & { SpeechRecognition?: new () => { lang: string; start: () => void; stop: () => void; onstart: () => void; onend: () => void; onerror: () => void; onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void } }).SpeechRecognition;
    if (!SpeechRecognition) {
      setAssistantOpen(true);
      setAssistantMessages((current) => [...current, { role: "assistant", content: "Voice search is not supported in this browser. Try Chrome or Safari, or type your request." }]);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setVoiceActive(true);
    recognition.onend = () => setVoiceActive(false);
    recognition.onerror = () => setVoiceActive(false);
    recognition.onresult = (event) => setQuery(event.results[0][0].transcript);
    recognition.start();
  }

  function openTitle(title: Title) {
    setSelected(title);
    setPlaybackError(false);
    const history = JSON.parse(window.localStorage.getItem("yupp-watch-history") ?? "[]") as number[];
    const nextHistory = [title.id, ...history.filter((id) => id !== title.id)].slice(0, 20);
    window.localStorage.setItem("yupp-watch-history", JSON.stringify(nextHistory));
    void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titleId: title.id, type: "play" }) });
  }

  function saveProfile(next: typeof profile) {
    setProfile(next);
    window.localStorage.setItem("yupp-profile", JSON.stringify(next));
    setProfileOpen(false);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Yupp TV home">
          <span className="brand-mark">Y</span>
          <span>yupp<span className="brand-dot">.</span>tv</span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className="active" href="#browse">Browse</a>
          <a href="#browse" onClick={() => setCategory("Live")}>Live TV</a>
          <a href="#browse" onClick={() => setCategory("Live")}>Sports</a>
        </nav>
        <div className="header-actions">
          <button className="watchlist-link" onClick={() => setShowWatchlist((value) => !value)}>
            <Icon>♡</Icon> My List <span className="list-count">{watchlist.length}</span>
          </button>
          <button className="watchlist-link" onClick={() => setProfileOpen((value) => !value)}><Icon>◉</Icon> Taste</button>
          <button className="avatar" aria-label="Open account menu">AK</button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-content">
          <p className="eyebrow"><span className="eyebrow-line" /> YUPP ORIGINAL</p>
          <h1 id="hero-title">Stories that<br /><em>stay with you.</em></h1>
          <p className="hero-copy">{titles[0].description}</p>
          <div className="hero-meta"><span>16+</span><span>•</span><span>{titles[0].meta}</span></div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => openTitle(titles[0])}><Icon>▶</Icon> Watch now</button>
            <button className="secondary-button" onClick={() => toggleWatchlist(titles[0].id)}>
              <Icon>{watchlist.includes(titles[0].id) ? "✓" : "+"}</Icon>
              {watchlist.includes(titles[0].id) ? "In my list" : "My list"}
            </button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-sun" />
          <div className="hero-mountain mountain-one" />
          <div className="hero-mountain mountain-two" />
          <div className="hero-grain" />
          <span className="hero-art-title">THE<br /><strong>LAST</strong><br />HORIZON</span>
        </div>
        <div className="hero-progress"><span /></div>
      </section>

      {continueWatching.length > 0 && !showWatchlist && !query && (
        <section className="continue-row"><div><p className="section-kicker">PICK UP WHERE YOU LEFT OFF</p><h2>Continue watching</h2></div><div className="continue-list">{continueWatching.map((title) => <button key={title.id} onClick={() => openTitle(title)}><span className={`mini-poster ${title.accent}`} /><span>{title.name}</span></button>)}</div></section>
      )}
      {profileOpen && <section className="profile-panel"><div><p className="section-kicker">YOUR TASTE PROFILE</p><h2>Make Yupp feel personal</h2><p>Recommendations use these preferences on this device. Sign in to sync them across screens.</p></div><label>Preferred language<select value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })}>{["English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada", "Bengali", "Marathi", "Punjabi"].map((value) => <option key={value}>{value}</option>)}</select></label><label>Favourite genre<select value={profile.genre} onChange={(event) => setProfile({ ...profile, genre: event.target.value })}>{["Family", "Drama", "Adventure", "Comedy", "Sports", "Food", "News"].map((value) => <option key={value}>{value}</option>)}</select></label><label>Preferred mood<select value={profile.mood} onChange={(event) => setProfile({ ...profile, mood: event.target.value })}>{["warm", "gripping", "uplifting", "comforting", "energetic", "inspiring"].map((value) => <option key={value}>{value}</option>)}</select></label><button className="primary-button" onClick={() => saveProfile(profile)}>Save taste profile</button></section>}

      <section className="catalog" id="browse">
        <div className="catalog-heading">
          <div>
            <p className="section-kicker">{showWatchlist ? "YOUR PICKS" : "EXPLORE YUPP"}</p>
            <h2>{showWatchlist ? "My list" : "What are you watching?"}</h2>
          </div>
          <label className="search-box">
            <Icon>⌕</Icon>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles..." aria-label="Search titles" />
            <button type="button" className={`voice-button ${voiceActive ? "recording" : ""}`} onClick={startVoiceSearch} aria-label="Search by voice">♩</button>
          </label>
        </div>
        <div className="filter-row">
          <div className="category-tabs" role="tablist" aria-label="Content categories">
            {categories.map((item) => (
              <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)} role="tab" aria-selected={category === item}>{item}</button>
            ))}
          </div>
          {showWatchlist && <button className="clear-filter" onClick={() => setShowWatchlist(false)}>Show all titles ×</button>}
        </div>
        {filteredTitles.length > 0 ? (
          <div className="title-grid">
            {filteredTitles.map((title) => (
              <article className="title-card" key={title.id}>
                <button className={`poster ${title.accent}`} onClick={() => openTitle(title)} aria-label={`Play ${title.name}`}>
                  <span className="poster-label">{title.category}</span>
                  <span className="poster-name">{title.name}</span>
                  {title.badge && <span className={`poster-badge ${title.badge === "LIVE" ? "live" : ""}`}>{title.badge}</span>}
                  <span className="poster-play">▶</span>
                </button>
                <div className="card-details">
                  <div><h3>{title.name}</h3><p>{title.meta}</p></div>
                  <button className={`save-button ${watchlist.includes(title.id) ? "saved" : ""}`} onClick={() => toggleWatchlist(title.id)} aria-label={`${watchlist.includes(title.id) ? "Remove" : "Add"} ${title.name} ${watchlist.includes(title.id) ? "from" : "to"} my list`}>{watchlist.includes(title.id) ? "✓" : "+"}</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state"><span>⌕</span><h3>No titles found</h3><p>Try another search or remove a filter.</p></div>
        )}
        {recommendations.length > 0 && !query && category === "All" && !showWatchlist && (
          <div className="recommendation-strip">
            <div><p className="section-kicker">PERSONALIZED FOR YOU</p><h2>Keep discovering</h2></div>
            <div><div className="recommendation-list">{recommendations.slice(0, 4).map((title) => <button key={title.id} onClick={() => openTitle(title)}><span className={`mini-poster ${title.accent}`} /><span>{title.name}</span></button>)}</div><small className="recommendation-reason">{recommendationReason}</small></div>
          </div>
        )}
      </section>

      <button className="assistant-launcher" onClick={() => setAssistantOpen((open) => !open)} aria-label="Open Yupp TV AI assistant"><span>✦</span><b>Ask Yupp AI</b></button>
      {assistantOpen && (
        <section className="assistant-panel" aria-label="Yupp TV AI assistant">
          <div className="assistant-header"><div><p className="section-kicker">YUPP AI</p><h2>Your watch companion</h2></div><button onClick={() => setAssistantOpen(false)} aria-label="Close assistant">×</button></div>
          <div className="assistant-messages">{assistantMessages.map((message, index) => <p className={message.role} key={`${message.role}-${index}`}>{message.content}</p>)}{assistantBusy && <p className="assistant">Thinking…</p>}</div>
          <form className="assistant-form" onSubmit={askAssistant}><input value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} placeholder="Find a movie, show, song..." aria-label="Ask Yupp AI" /><button type="submit" disabled={assistantBusy}>↑</button></form>
          <small>AI answers use the Yupp catalog. Add OPENAI_API_KEY on the server for model-powered conversations.</small>
        </section>
      )}

      <footer><span className="brand small"><span className="brand-mark">Y</span>yupp<span className="brand-dot">.</span>tv</span><span>Made for the stories you want to keep watching.</span><span>© 2025 Yupp TV</span></footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div className="player-modal" role="dialog" aria-modal="true" aria-labelledby="player-title" onClick={(event) => event.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelected(null)} aria-label="Close player">×</button>
            <div className={`player-screen ${selected.accent}`}>
              {selected.video && !playbackError ? <video controls autoPlay playsInline src={selected.video} onError={() => setPlaybackError(true)} /> : <div className="coming-soon"><span className="poster-play">▶</span><p>{selected.category === "Live" ? "Live stream not connected" : "Preview unavailable"}</p><small>{selected.category === "Live" ? "Add this channel’s HLS/DASH stream URL in the catalog before publishing." : "Add a licensed playback URL from your video provider before publishing."}</small></div>}
            </div>
            <div className="player-info"><p className="section-kicker">{selected.category} • {selected.meta}</p><h2 id="player-title">{selected.name}</h2><p>{selected.description}</p><button className="secondary-button" onClick={() => toggleWatchlist(selected.id)}>{watchlist.includes(selected.id) ? "✓ In my list" : "+ Add to my list"}</button></div>
          </div>
        </div>
      )}
    </main>
  );
}
