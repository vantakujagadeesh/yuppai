# Yupp TV

Yupp TV is a responsive streaming catalog MVP built with Next.js 16, React 19, and Tailwind CSS. The current product flow is deliberately self-contained so it works from a clean checkout:

- Browse movies, series, and live channels
- Search titles by name, description, or category
- Open a title detail/player view
- Play the featured sample stream
- Add and remove titles from a persistent local watchlist
- Use the layout on mobile, tablet, and desktop

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Before opening a pull request, run the same checks used by CI:

```bash
npm run lint
npm run build
```

## Delivery pipeline

`.github/workflows/ci.yml` runs on pushes to `main` and all pull requests targeting `main`. It uses a locked `npm ci` install, Node 20, linting, and a production build. The workflow is intentionally provider-neutral: connect the repository to Vercel, Netlify, or your preferred Next.js host for deployment after CI passes.

Vercel deployment settings are checked into `vercel.json`. Import the repository into Vercel and leave the project settings at their defaults; Vercel will use `npm ci`, `npm run build`, and the Next.js framework configuration from that file. No project IDs, tokens, or environment secrets are committed.

## Product integration points

The catalog data currently lives at the top of `src/app/page.tsx` so the MVP can be evaluated without a backend. For production, replace that array with a server-side catalog/API and replace the sample video URL with the authenticated playback URL from the chosen streaming provider. The watchlist currently uses browser `localStorage`; move it to the account service when authentication is introduced.

## AI and backend MVP

The app now has server-side route handlers for catalog search (`/api/catalog`), recommendations (`/api/ai/recommendations`), the assistant (`/api/ai/chat`), metadata enrichment (`/api/ai/enrich`), playback events (`/api/events`), and service health (`/api/health`). The UI includes natural-language search, browser voice search, a Yupp AI assistant, watch-history recommendations, and automatic catalog tags for language, genre, mood, and cast.

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` in the Vercel project’s server-side Environment Variables to enable model-backed assistant answers and generated summaries. Without a key, the same endpoints use a deterministic, catalog-safe fallback so the published MVP remains usable and never exposes a secret to the browser. The AI client now tolerates provider outages, non-JSON responses, unsupported provider options, and timeouts by falling back to catalog search. Before a public launch with real users, replace the in-memory event buffer and local storage with authenticated Postgres-backed user profiles, watch history, and entitlements.

If `/api/health` reports `aiProvider: true` but assistant requests log a `401`, the configured provider key is invalid, revoked, or has no API access. Replace it in Vercel Production environment variables and redeploy; never commit or paste keys into source control. The catalog assistant remains available in fallback mode. Playback also requires licensed provider URLs: titles without a configured stream intentionally show a clear unavailable state instead of pretending to play.
