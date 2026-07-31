# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single Node.js/Express app (Aashish Joshi's portfolio site). There is no database, no monorepo, and no Docker/Makefile.

### Running the app (dev)
- Start the server with `npm start` (equivalent to `npm run dev`; both run `node server.js`). It listens on `http://localhost:3000` (override with the `PORT` env var).
- The dev server has no watch/hot-reload; restart the process after editing `server.js`.
- Run it under tmux (or otherwise in the background) so it keeps running while you test.

### Lint / test / build
- There are no lint, test, or build scripts. `package.json` only defines `start` and `dev`. It's a static frontend served by Express, so there is nothing to compile.

### Services and env vars (all optional to boot)
- `GET /api/github-projects`: without `GITHUB_TOKEN`, it falls back to `data/projects.json`, so it returns real data offline. With a token it calls the GitHub API.
- `POST /api/send` (contact form): requires `EMAIL_USER` + `EMAIL_PASS` (Gmail app password). Without them it correctly returns HTTP 500 `{"message":"Server configuration error."}`; with empty fields it returns HTTP 400. See `.env.example`.

### Non-obvious gotchas
- The frontend JS is loaded as an ES module (`public/assets/js/script.js`, `type="module"`) and initializes on `DOMContentLoaded`; a single JS parse error takes down all client-side features (dynamic project cards, contact-form submit handler, typing animation). If GUI features silently don't work, check the browser DevTools console for a `SyntaxError` before assuming an environment problem — the static HTML/CSS still renders fine without JS.
- `public/index.html` sets `data-api-base` to a remote Render backend, but on `localhost`/`127.0.0.1` the client tries same-origin `/api` first, so the local Express server serves the APIs during local dev.
