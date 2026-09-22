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
