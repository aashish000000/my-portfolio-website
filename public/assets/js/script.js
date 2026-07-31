/**
 * Aashish Joshi Portfolio — v4
 * Loader, cursor, theme, reveals, projects, terminal, contact
 */

const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefs = {
    reduceMotion: reduceMotionMQ.matches,
    saveData: navigator.connection?.saveData ?? false,
};

reduceMotionMQ.addEventListener?.('change', (e) => {
    prefs.reduceMotion = e.matches;
});

const API_BASE = (document.body?.dataset?.apiBase || '').trim().replace(/\/+$/, '');
const IS_LOCAL_API = /^localhost$|^127\.0\.0\.1$/i.test(window.location.hostname || '');
const API_BASES = !API_BASE ? [''] : IS_LOCAL_API ? ['', API_BASE] : [API_BASE];

let projectsLoaded = false;
let contactFormReady = false;

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');
    initLoader();
    initCursor();
    initTheme();
    initNav();
    initResumeLinks();
    initReveals();
    initMetrics();
    initTerminal();
    initSolarSystem();
    updateFooterYear();
    setupLazyInit();
});

// ─────────────────────────────────────────────
// Page loader
// ─────────────────────────────────────────────

function initLoader() {
    const loader = document.getElementById('page-loader');
    const fill = document.getElementById('loader-fill');
    const num = document.getElementById('loader-num');
    const hello = document.getElementById('loader-hello');
    const lang = document.getElementById('loader-lang');
    if (!loader || !fill || !num) return;

    const greetings = [
        { text: 'नमस्ते', lang: 'Nepali' },
        { text: 'Hello', lang: 'English' },
        { text: 'Namaste', lang: 'Hindi' },
        { text: 'Welcome', lang: 'English' },
    ];

    let progress = 0;
    let greetIdx = 0;

    const greetTimer = setInterval(() => {
        greetIdx = (greetIdx + 1) % greetings.length;
        if (hello) hello.textContent = greetings[greetIdx].text;
        if (lang) lang.textContent = greetings[greetIdx].lang;
    }, 450);

    const tick = () => {
        progress = Math.min(100, progress + (prefs.reduceMotion ? 20 : Math.random() * 14 + 4));
        fill.style.width = `${progress}%`;
        num.textContent = `${Math.floor(progress)}%`;
        if (progress < 100) {
            requestAnimationFrame(() => setTimeout(tick, prefs.reduceMotion ? 20 : 60));
        } else {
            clearInterval(greetTimer);
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.add('loaded');
            }, prefs.reduceMotion ? 50 : 350);
        }
    };
    tick();
}

// ─────────────────────────────────────────────
// Custom cursor
// ─────────────────────────────────────────────

function initCursor() {
    const dot = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    if (window.matchMedia('(pointer: coarse)').matches || prefs.reduceMotion) return;

    document.body.classList.add('has-custom-cursor');
    let x = 0;
    let y = 0;
    let rx = 0;
    let ry = 0;

    window.addEventListener('mousemove', (e) => {
        x = e.clientX;
        y = e.clientY;
        dot.style.transform = `translate(${x - 5}px, ${y - 5}px)`;
    }, { passive: true });

    const loop = () => {
        rx += (x - rx) * 0.18;
        ry += (y - ry) * 0.18;
        ring.style.transform = `translate(${rx - 19}px, ${ry - 19}px)`;
        requestAnimationFrame(loop);
    };
    loop();

    const hoverables = 'a, button, input, textarea, .project-card, .exp-card, .stack-card, .term-tab';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverables)) {
            dot.classList.add('hover');
            ring.classList.add('hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverables)) {
            dot.classList.remove('hover');
            ring.classList.remove('hover');
        }
    });
}

// ─────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────

function initTheme() {
    const root = document.documentElement;
    const btn = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'day' || saved === 'night') {
        root.setAttribute('data-theme', saved);
    }

    btn?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'day' ? 'night' : 'day';
        root.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);
    });
}

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────

function initNav() {
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const links = document.querySelectorAll('.nav-links a, .mobile-link');
    const sections = document.querySelectorAll('main section[id]');

    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    hamburger?.addEventListener('click', () => {
        const open = mobileNav?.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(!!open));
    });

    mobileNav?.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            hamburger?.classList.remove('open');
            hamburger?.setAttribute('aria-expanded', 'false');
        });
    });

    if (!links.length || !sections.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute('id');
            document.querySelectorAll('.nav-links a').forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach((s) => observer.observe(s));
}

function initResumeLinks() {
    const resumePath = 'assets/docs/Aashish_Resume.pdf';
    const anchors = document.querySelectorAll('a[data-resume-link]');
    if (!anchors.length) return;
    const path = window.location.pathname || '/';
    const basePath = path.endsWith('/') ? path : `${path}/`;
    const href = `${window.location.origin}${basePath}${resumePath}`;
    anchors.forEach((a) => a.setAttribute('href', href));
}

// ─────────────────────────────────────────────
// Reveals + metrics
// ─────────────────────────────────────────────

function initReveals() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (prefs.reduceMotion) {
        els.forEach((el) => el.classList.add('visible'));
        return;
    }
    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            o.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
}

function initMetrics() {
    const nums = document.querySelectorAll('.hero-metric-num[data-count]');
    if (!nums.length) return;

    const animate = (el) => {
        const target = Number(el.dataset.count || 0);
        if (prefs.reduceMotion) {
            el.textContent = `${target}+`;
            return;
        }
        const start = performance.now();
        const dur = 1200;
        const step = (now) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = `${Math.floor(target * eased)}+`;
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = `${target}+`;
        };
        requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animate(entry.target);
            o.unobserve(entry.target);
        });
    }, { threshold: 0.4 });
    nums.forEach((n) => obs.observe(n));
}

// ─────────────────────────────────────────────
// Terminal demo
// ─────────────────────────────────────────────

function initTerminal() {
    const tabs = document.querySelectorAll('.term-tab');
    const codeEl = document.getElementById('term-code');
    const preview = document.getElementById('term-preview');
    if (!tabs.length || !codeEl || !preview) return;

    const snippets = {
        html: {
            code: `<span class="tok-cm">&lt;!-- Hello from Aashish --&gt;</span>
<span class="tok-kw">&lt;h1&gt;</span>Hello World!<span class="tok-kw">&lt;/h1&gt;</span>`,
            preview: '<h3>Hello World!</h3>',
        },
        js: {
            code: `<span class="tok-kw">const</span> greet = <span class="tok-fn">()</span> => {
  <span class="tok-kw">return</span> <span class="tok-str">'Hello World!'</span>;
};
<span class="tok-fn">console.log</span>(greet());`,
            preview: '<h3>Hello World!</h3><p style="color:var(--text-dim);font-size:14px;margin-top:8px;font-family:var(--font-mono)">→ Hello World!</p>',
        },
        py: {
            code: `<span class="tok-kw">def</span> <span class="tok-fn">greet</span>():
    <span class="tok-kw">return</span> <span class="tok-str">"Hello World!"</span>

<span class="tok-fn">print</span>(greet())`,
            preview: '<h3>Hello World!</h3><p style="color:var(--text-dim);font-size:14px;margin-top:8px;font-family:var(--font-mono)">Hello World!</p>',
        },
        sql: {
            code: `<span class="tok-kw">SELECT</span> <span class="tok-str">'Hello World!'</span>
<span class="tok-kw">AS</span> greeting;`,
            preview: '<h3>Hello World!</h3><p style="color:var(--text-dim);font-size:14px;margin-top:8px;font-family:var(--font-mono)">greeting</p>',
        },
    };

    const setLang = (lang) => {
        const snip = snippets[lang] || snippets.html;
        codeEl.innerHTML = snip.code;
        preview.innerHTML = snip.preview;
        tabs.forEach((tab) => {
            const active = tab.dataset.lang === lang;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', String(active));
        });
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => setLang(tab.dataset.lang));
    });
    setLang('html');
}

// ─────────────────────────────────────────────
// Constellation orbit (Tools of the Trade)
// ─────────────────────────────────────────────

const STACK_DOMAINS = {
    languages: {
        num: '01',
        title: 'Languages',
        level: 'Expert',
        chips: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'SQL', 'PHP'],
        pct: 88,
    },
    frameworks: {
        num: '02',
        title: 'Frameworks',
        level: 'Advanced',
        chips: ['Next.js', 'Node.js', 'Express', 'ASP.NET Core', 'Tkinter'],
        pct: 84,
    },
    databases: {
        num: '03',
        title: 'Databases',
        level: 'Proficient',
        chips: ['MySQL', 'MongoDB', 'NeDB'],
        pct: 78,
    },
    ai: {
        num: '04',
        title: 'AI & Product',
        level: 'Advanced',
        chips: ['OpenAI API', 'Chatbots', 'Photo Recognition', 'Analytics'],
        pct: 80,
    },
    engineering: {
        num: '05',
        title: 'Engineering',
        level: 'Expert',
        chips: ['REST APIs', 'WebSockets', 'System Design', 'Accessibility'],
        pct: 86,
    },
    craft: {
        num: '06',
        title: 'Craft',
        level: 'Advanced',
        chips: ['UI/UX', 'Design Systems', 'Performance', 'Docs'],
        pct: 82,
    },
};

function initSolarSystem() {
    const system = document.getElementById('solar-system');
    const planets = [...document.querySelectorAll('.planet')];
    const orbit = document.getElementById('stack-orbit');
    const grid = document.getElementById('stack-grid');
    const toggleBtns = document.querySelectorAll('.view-toggle-btn');
    if (!system || !planets.length) return;

    if (prefs.reduceMotion) system.classList.add('reduce-motion');

    // Highlight only — no side panel; orbits never pause on hover
    planets.forEach((planet) => {
        planet.addEventListener('click', () => {
            planets.forEach((p) => {
                p.setAttribute('aria-pressed', String(p === planet));
            });
        });
    });

    const setView = (view) => {
        const isOrbit = view === 'orbit';
        if (orbit) {
            orbit.hidden = !isOrbit;
            orbit.dataset.active = String(isOrbit);
        }
        if (grid) {
            grid.hidden = isOrbit;
            grid.dataset.active = String(!isOrbit);
        }
        toggleBtns.forEach((btn) => {
            const active = btn.dataset.view === view;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
    };

    toggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => setView(btn.dataset.view || 'orbit'));
    });

    setView('orbit');
}

function setupLazyInit() {
    const sectionMap = new WeakMap();
    const lazyObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            sectionMap.get(entry.target)?.();
            obs.unobserve(entry.target);
        });
    }, { rootMargin: '160px 0px' });

    const register = (id, fn) => {
        const el = document.getElementById(id);
        if (!el) return;
        sectionMap.set(el, fn);
        lazyObserver.observe(el);
    };

    register('projects', () => initProjects());
    register('contact', () => initContactForm());
}

// ─────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────

function initProjects() {
    if (projectsLoaded) return;
    projectsLoaded = true;

    const grid = document.getElementById('project-grid');
    const loader = document.getElementById('projects-loader');
    const errEl = document.getElementById('projects-error');
    if (!grid) return;

    if (prefs.saveData && errEl) {
        if (loader) loader.style.display = 'none';
        errEl.innerHTML = 'Projects skipped to save data. <button type="button" class="retry-btn">Load anyway</button>';
        errEl.classList.remove('hidden');
        errEl.querySelector('.retry-btn')?.addEventListener('click', () => {
            errEl.classList.add('hidden');
            fetchProjects(grid, loader, errEl);
        }, { once: true });
        return;
    }

    fetchProjects(grid, loader, errEl);
}

async function fetchProjects(grid, loader, errEl) {
    if (errEl) {
        errEl.textContent = '';
        errEl.classList.add('hidden');
    }

    try {
        // Curated projects.json is the source of truth (Netlify/static + removes retired projects).
        let projects;
        try {
            const res = await fetch('/projects.json', { cache: 'no-store' });
            if (!res.ok) throw new Error('Could not load projects.');
            const raw = await res.json();
            projects = raw.map((p) => ({
                id: p.id,
                title: p.title,
                description: p.description,
                githubUrl: p.githubUrl,
                stars: 0,
                language: p.technologies?.[0] || 'JavaScript',
            }));
        } catch (staticErr) {
            // Fallback to API only if static file is missing
            projects = await jsonFetch('/api/github-projects', { credentials: 'same-origin' });
        }
        renderProjects(projects, grid, loader);
    } catch (err) {
        console.error('[projects]', err);
        if (loader) loader.style.display = 'none';
        if (errEl) {
            errEl.innerHTML = `${err.message} <button type="button" class="retry-btn">Retry</button>`;
            errEl.classList.remove('hidden');
            errEl.querySelector('.retry-btn')?.addEventListener('click', () => {
                errEl.classList.add('hidden');
                fetchProjects(grid, loader, errEl);
            }, { once: true });
        }
    }
}

function renderProjects(projects, grid, loader) {
    if (loader) loader.style.display = 'none';
    if (!grid) return;
    grid.innerHTML = '';

    if (!projects?.length) {
        grid.innerHTML = '<p style="text-align:center;color:var(--text-dim);grid-column:1/-1">No public projects found.</p>';
        return;
    }

    const frag = document.createDocumentFragment();
    projects.forEach((p, i) => {
        const card = document.createElement('article');
        card.className = 'project-card reveal visible';
        const lang = p.language
            ? `<span class="project-lang">${escapeHtml(p.language)}</span>`
            : '';
        const num = String(i + 1).padStart(2, '0');
        card.innerHTML = `
            <div class="project-card-top">
                <span class="project-lang">${num}</span>
                <span class="project-stars">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    ${p.stars ?? 0}
                </span>
            </div>
            <h3>${escapeHtml(p.title)}</h3>
            <p class="project-desc">${escapeHtml(p.description)}</p>
            <div class="project-footer">
                ${lang}
                <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-link">
                    View metrics ↗
                </a>
            </div>`;
        frag.appendChild(card);
    });
    grid.appendChild(frag);
}

// ─────────────────────────────────────────────
// Contact form
// ─────────────────────────────────────────────

function initContactForm() {
    if (contactFormReady) return;
    const form = document.getElementById('contact-form');
    if (!form) return;
    contactFormReady = true;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('form-submit-btn');
        const responseEl = document.getElementById('form-response');
        if (!submitBtn || !responseEl) return;

        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25" stroke-width="4"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-width="4"/>
            </svg>
            <span class="btn-text">Sending…</span>`;

        responseEl.textContent = '';
        responseEl.className = 'form-response';

        const payload = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            message: form.message.value.trim(),
        };

        try {
            const result = await jsonFetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'same-origin',
            });
            responseEl.textContent = result?.message || "Message sent! I'll be in touch soon.";
            responseEl.classList.add('success');
            form.reset();
        } catch (err) {
            responseEl.textContent = err.message || 'Something went wrong. Please try again.';
            responseEl.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
}

function updateFooterYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}

async function jsonFetch(path, options = {}) {
    let lastErr = null;
    for (const base of API_BASES) {
        const url = `${base}${path}`;
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timer);
            const isJson = (res.headers.get('content-type') || '').includes('application/json');
            if (!res.ok) {
                let msg = `Request failed (${res.status})`;
                if (isJson) {
                    try {
                        const body = await res.json();
                        if (body?.message) msg = body.message;
                    } catch (_) { /* noop */ }
                }
                // Real HTTP response from a reachable host — do not fan out to other bases.
                const err = new Error(msg);
                err.fatal = true;
                throw err;
            }
            if (!isJson) throw new Error('Invalid response from server.');
            return res.json();
        } catch (err) {
            lastErr = err;
            if (err?.fatal) throw err;
        }
    }
    throw lastErr ?? new Error('Request failed.');
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
