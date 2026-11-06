# Aashish Joshi — Portfolio Website

Personal portfolio with an immersive terminal/solar-system UI (obsidian + electric jade). Live sites:

| Host | URL |
|------|-----|
| **Custom domain** | [aashishthegreat.com](https://aashishthegreat.com) *(DNS propagating)* |
| **Netlify** | [aashishthegreat-portfolio.netlify.app](https://aashishthegreat-portfolio.netlify.app) |
| **Vercel** | [my-portfolio-website-inky-two.vercel.app](https://my-portfolio-website-inky-two.vercel.app) |

---

## Features

| Feature | Description |
|---------|-------------|
| Terminal hero | Boot sequence, typing intro, custom cursor |
| Tools of the Trade | Full-viewport solar system with elliptical orbits |
| Featured projects | Curated list from `public/projects.json` (MoodRing, Calorie Calculator, Expense Splitter) |
| Experience / education | Timeline and cards |
| Theme toggle | Light / dark |
| Contact form | Works when Express backend is running (`EMAIL_*` env) |
| Responsive + a11y | Mobile layout; respects `prefers-reduced-motion` |

---

## Project structure

```
my-portfolio-website/
├── public/                 # Static site (Netlify publish root)
│   ├── index.html
│   ├── projects.json       # Featured projects (frontend source of truth)
│   └── assets/
│       ├── css/style.css
│       ├── js/script.js
│       ├── img/
│       └── docs/           # Resume PDF
├── data/projects.json      # Express API fallback (keep in sync with public/)
├── server.js               # Express: static + /api/github-projects + /api/send
├── netlify.toml            # Netlify: publish public/, cache headers
├── package.json
├── .env.example
└── AGENTS.md               # Cursor Cloud / agent notes
```

---

## Tech stack

- **Frontend:** HTML, CSS (custom properties), vanilla JS (ES modules)
- **Backend (optional for static hosts):** Node.js ≥18, Express, Nodemailer, Axios
- **Deploy:** Netlify (static `public/`), Vercel, or Render/Node for contact API

---

## Getting started

### Prerequisites

- Node.js v18+
- Optional: Gmail app password for the contact form
- Optional: GitHub token if you want live `/api/github-projects` instead of JSON fallback

### Install & run (local Express)

```bash
git clone https://github.com/aashish000000/my-portfolio-website.git
cd my-portfolio-website
npm install
cp .env.example .env   # fill EMAIL_USER / EMAIL_PASS if you need contact form
npm start              # same as npm run dev → http://localhost:3000
```

### Environment variables

```env
PORT=3000
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_gmail_app_password
GITHUB_TOKEN=optional_github_pat
```

Gmail needs an [App Password](https://support.google.com/accounts/answer/185833) with 2FA enabled.

---

## API endpoints (Express only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Portfolio (`public/`) |
| `GET` | `/api/github-projects` | Pinned repos (falls back to `data/projects.json`) |
| `POST` | `/api/send` | Contact form (needs `EMAIL_USER` + `EMAIL_PASS`) |

On **Netlify/Vercel static**, there is no Express process: the UI loads `/projects.json` directly. Contact form needs a serverless function or a separate Node host to work in production.

Pinned repo names for the API live in `server.js` (`pinnedRepos`). Keep `public/projects.json` and `data/projects.json` aligned when editing featured projects.

---

## Customization

### Featured projects

Edit both (keep identical):

- `public/projects.json` — what the live static site shows
- `data/projects.json` — Express fallback

Also update `pinnedRepos` in `server.js` if you use the GitHub API path.

### Theme / motion

CSS variables and layout live in `public/assets/css/style.css`. Client behavior is in `public/assets/js/script.js`.

---

## Deployment

### Netlify (primary custom-domain host)

1. Connect this GitHub repo in [Netlify](https://app.netlify.com).
2. Publish directory: `public` (already set in `netlify.toml`).
3. Build command: none required (`netlify.toml` uses a no-op echo).
4. Attach custom domain `aashishthegreat.com` + `www`.

**DNS (Domain.com / Network Solutions → Advanced DNS):**

| Type | Name | Value |
|------|------|--------|
| A | `@` | `75.2.60.5` |
| CNAME | `www` | `aashishthegreat-portfolio.netlify.app` |

Allow time for apex propagation; Netlify issues HTTPS once DNS is correct.

Site admin: [aashishthegreat-portfolio](https://app.netlify.com/projects/aashishthegreat-portfolio)

### Vercel

Import the repo; serve `public/` as the static root (or use the Express entry if you enable the Node server).

### Render / any Node host (contact form + API)

- Build: `npm install`
- Start: `npm start`
- Set `EMAIL_USER`, `EMAIL_PASS`, optional `GITHUB_TOKEN`

---

## License

ISC

---

## Connect

- [GitHub](https://github.com/aashish000000)
- [LinkedIn](https://linkedin.com/in/aa-joshi)
- [Instagram](https://www.instagram.com/__aashishthegreat/)
