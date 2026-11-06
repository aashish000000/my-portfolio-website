# AGENTS.md

## Cursor Cloud specific instructions

Single Node.js/Express portfolio (static UI in `public/`). No database, no monorepo, no Docker/Makefile.

### Running the app (dev)

- `npm start` / `npm run dev` → `node server.js` on `http://localhost:3000` (`PORT` overrides).
- No watch/hot-reload; restart after editing `server.js`.
- Run under tmux (or background) while testing the UI.

### Lint / test / build

- No lint, test, or build scripts in `package.json`. Static frontend + Express only.

### Static vs API

- **Netlify** publishes `public/` only (`netlify.toml`). Featured projects come from `/projects.json`.
- **Express** also serves `public/` and exposes:
  - `GET /api/github-projects` — uses `GITHUB_TOKEN` or falls back to `data/projects.json`
  - `POST /api/send` — needs `EMAIL_USER` + `EMAIL_PASS`; otherwise HTTP 500 config error (empty fields → 400). See `.env.example`.
- Keep `public/projects.json` and `data/projects.json` in sync. `pinnedRepos` in `server.js` must match if you rely on the GitHub API path.
- Contact form does **not** work on pure static Netlify without adding functions or pointing the form at a Node backend.

### Non-obvious gotchas

- Frontend JS is an ES module (`public/assets/js/script.js`). One parse/`SyntaxError` disables projects, contact submit, typing, solar system, etc., while HTML/CSS still look fine — check the browser console first.
- Custom domain DNS: apex A → Netlify load balancer `75.2.60.5`, `www` CNAME → `aashishthegreat-portfolio.netlify.app`. Until apex propagates away from Domain.com parking (`208.91.197.27`), HTTPS on the bare domain will fail; `www` may reach Netlify earlier.
- Do not commit Netlify auth tokens; `.netlify/` is gitignored.
