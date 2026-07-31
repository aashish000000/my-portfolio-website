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
    initExperience();
    initFuelTilt();
    initTerminal();
    initSolarSystem();
    updateFooterYear();
    setupLazyInit();
});

// ─────────────────────────────────────────────
// Page loader — cycle greetings over ~4s
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
        { text: 'नमस्कार', lang: 'Hindi' },
        { text: 'Hola', lang: 'Spanish' },
        { text: '你好', lang: 'Chinese' },
        { text: 'سلام', lang: 'Urdu' },
        { text: 'Bonjour', lang: 'French' },
        { text: 'Ciao', lang: 'Italian' },
        { text: 'こんにちは', lang: 'Japanese' },
        { text: '안녕하세요', lang: 'Korean' },
        { text: 'Olá', lang: 'Portuguese' },
        { text: 'مرحبا', lang: 'Arabic' },
    ];

    const DURATION = prefs.reduceMotion ? 400 : 4000;
    const stepMs = DURATION / greetings.length;
    let greetIdx = 0;
    const started = performance.now();

    if (hello) hello.textContent = greetings[0].text;
    if (lang) lang.textContent = greetings[0].lang;

    const greetTimer = setInterval(() => {
        greetIdx = Math.min(greetIdx + 1, greetings.length - 1);
        if (hello) {
            hello.style.opacity = '0';
            requestAnimationFrame(() => {
                hello.textContent = greetings[greetIdx].text;
                hello.style.opacity = '1';
            });
        }
        if (lang) lang.textContent = greetings[greetIdx].lang;
        if (greetIdx >= greetings.length - 1) clearInterval(greetTimer);
    }, stepMs);

    const tick = (now) => {
        const elapsed = now - started;
        const progress = Math.min(100, (elapsed / DURATION) * 100);
        fill.style.width = `${progress}%`;
        num.textContent = `${Math.floor(progress)}%`;
        if (progress < 100) {
            requestAnimationFrame(tick);
        } else {
            clearInterval(greetTimer);
            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.add('loaded');
            }, prefs.reduceMotion ? 40 : 280);
        }
    };
    requestAnimationFrame(tick);
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

    const hoverables = 'a, button, input, textarea, .project-card, .exp-rail-item, .stack-card, .fuel-svc, .term-tab, .planet';
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
// Experience — Mission Log / Signal Deck
// ─────────────────────────────────────────────

const EXPERIENCE = [
    {
        id: 'intern',
        year: '2026',
        short: 'Summer Intern',
        org: 'Kean University',
        title: 'Undergraduate Summer Intern',
        meta: 'Kean University · Jersey City, NJ · May–Jul 2026',
        file: 'kean-intern',
        summary: 'Selected for a paid summer cohort: workshops, faculty mentorship, and a capstone presentation that ties research to shipped work.',
        telemetry: [
            { label: 'Duration', value: '10 wks' },
            { label: 'Mode', value: 'Paid' },
            { label: 'Output', value: 'Capstone' },
        ],
        log: [
            { tag: 'SELECT', text: 'Accepted into the Undergraduate Summer Internship Program.' },
            { tag: 'BUILD', text: 'Workshops + mentorship folded into hands-on product work.' },
            { tag: 'SHIP', text: 'Presented capstone work with the summer cohort.' },
            { tag: 'NEXT', text: 'Carry systems thinking into full-time engineering.' },
        ],
        signals: [
            { name: 'Workshops', pct: 35 },
            { name: 'Mentorship', pct: 30 },
            { name: 'Capstone', pct: 35 },
        ],
        tags: ['Internship', 'Mentorship', 'Workshops', 'Presentation'],
    },
    {
        id: 'ta',
        year: '23–24',
        short: 'Teaching Assistant',
        org: 'Caldwell University',
        title: 'Teaching Assistant',
        meta: 'Caldwell University · Caldwell, NJ · Sep 2023 – May 2024',
        file: 'ta-labs',
        summary: 'Tutored full-stack fundamentals, kept CS labs healthy, and turned confusing bugs into teachable moments.',
        telemetry: [
            { label: 'Reach', value: '40+' },
            { label: 'Terms', value: '2' },
            { label: 'Domain', value: 'CS Labs' },
        ],
        log: [
            { tag: 'TUTOR', text: 'Guided peers through full-stack fundamentals.' },
            { tag: 'OPS', text: 'Set up and troubleshot lab technology under load.' },
            { tag: 'CLEAR', text: 'Kept sessions moving when tooling failed.' },
            { tag: 'CRAFT', text: 'Leveled up debugging + explanation skills.' },
        ],
        signals: [
            { name: 'Tutoring', pct: 50 },
            { name: 'Lab Ops', pct: 30 },
            { name: 'Prep', pct: 20 },
        ],
        tags: ['Teaching', 'Full Stack', 'Labs', 'Debugging'],
    },
    {
        id: 'ra',
        year: '2024',
        short: 'Resident Assistant',
        org: 'Caldwell University',
        title: 'Resident Assistant',
        meta: 'Caldwell University · Caldwell, NJ · 2024',
        file: 'ra-floor',
        summary: 'Ran community on the floor — engagement, conflict resolution, and a safe inclusive living culture.',
        telemetry: [
            { label: 'Residents', value: '60+' },
            { label: 'Duty', value: 'On-call' },
            { label: 'Focus', value: 'Community' },
        ],
        log: [
            { tag: 'ENGAGE', text: 'Programmed inclusive community events.' },
            { tag: 'RESOLVE', text: 'Mediated conflicts with clear policy guidance.' },
            { tag: 'LEAD', text: 'Modeled accountability and care on the floor.' },
            { tag: 'TRANSFER', text: 'Leadership habits that map to product teams.' },
        ],
        signals: [
            { name: 'Community', pct: 40 },
            { name: 'Conflict', pct: 25 },
            { name: 'Ops', pct: 35 },
        ],
        tags: ['Leadership', 'Community', 'Policy', 'Empathy'],
    },
    {
        id: 'mentor',
        year: '2024',
        short: 'Tech Mentor',
        org: 'Robotics Club',
        title: 'Technical Mentor, Robotics',
        meta: 'Caldwell University · Spring 2024',
        file: 'robotics-mentor',
        summary: 'Mentored juniors on Raspberry Pi and STM32 — from blinky boards to competition-ready robots.',
        telemetry: [
            { label: 'Stack', value: 'Pi/STM' },
            { label: 'Mode', value: 'Hands-on' },
            { label: 'Goal', value: 'Compete' },
        ],
        log: [
            { tag: 'TEACH', text: 'Introduced Pi + STM32 bring-up workflows.' },
            { tag: 'ASSEMBLE', text: 'Guided mechanical + electrical assembly.' },
            { tag: 'DEBUG', text: 'Pair-debugged sensors, power, and firmware.' },
            { tag: 'SHIP', text: 'Helped juniors hit competition milestones.' },
        ],
        signals: [
            { name: 'Embedded', pct: 45 },
            { name: 'Hardware', pct: 30 },
            { name: 'Mentoring', pct: 25 },
        ],
        tags: ['Raspberry Pi', 'STM32', 'C/C++', 'Robotics'],
    },
    {
        id: 'redcross',
        year: '20–21',
        short: 'Disaster Response',
        org: 'Red Cross Society',
        title: 'Disaster Response Team',
        meta: 'Red Cross Society · Kathmandu, Nepal · Jul 2020 – Dec 2021',
        file: 'red-cross',
        summary: 'Field relief during floods and earthquakes — logistics, distribution, and calm under pressure.',
        telemetry: [
            { label: 'Active', value: '18 mo' },
            { label: 'Theater', value: 'Field' },
            { label: 'Mission', value: 'Aid' },
        ],
        log: [
            { tag: 'TRAIN', text: 'Prepared for flood and earthquake response.' },
            { tag: 'RESPOND', text: 'Supported relief during active disasters.' },
            { tag: 'DISTRIBUTE', text: 'Moved emergency aid to communities in need.' },
            { tag: 'LEARN', text: 'Systems thinking under real-world pressure.' },
        ],
        signals: [
            { name: 'Relief', pct: 45 },
            { name: 'Logistics', pct: 35 },
            { name: 'Support', pct: 20 },
        ],
        tags: ['Volunteer', 'Crisis', 'Logistics', 'Service'],
    },
    {
        id: 'aiclub',
        year: '21–22',
        short: 'AI Club President',
        org: 'Liverpool College',
        title: 'President, AI Club',
        meta: 'Liverpool College · Kathmandu, Nepal · Jan 2021 – Dec 2022',
        file: 'ai-club',
        summary: 'Led a student robotics/AI team from fuzzy briefs to competition-ready builds on hard deadlines.',
        telemetry: [
            { label: 'Tenure', value: '2 yrs' },
            { label: 'Unit', value: 'Team' },
            { label: 'Bias', value: 'Ship' },
        ],
        log: [
            { tag: 'FOUND', text: 'Organized peers around AI + robotics goals.' },
            { tag: 'SCOPE', text: 'Turned competition requirements into a plan.' },
            { tag: 'DELIVER', text: 'Shipped builds against hard deadlines.' },
            { tag: 'HANDOFF', text: 'Left playbooks for the next officers.' },
        ],
        signals: [
            { name: 'Leadership', pct: 35 },
            { name: 'Engineering', pct: 40 },
            { name: 'Competition', pct: 25 },
        ],
        tags: ['AI', 'Robotics', 'Leadership', 'Deadlines'],
    },
];

function initExperience() {
    const rail = document.getElementById('exp-rail');
    const body = document.getElementById('exp-doss-body');
    const pathEl = document.getElementById('exp-path');
    const statusEl = document.getElementById('exp-status');
    if (!rail || !body) return;

    rail.innerHTML = EXPERIENCE.map((item, i) => `
        <button type="button" class="exp-rail-item${i === 0 ? ' is-active' : ''}"
            role="option" aria-selected="${i === 0 ? 'true' : 'false'}"
            data-exp-id="${item.id}" id="exp-opt-${item.id}">
            <span class="exp-rail-year">${item.year}</span>
            <span>
                <span class="exp-rail-role">${item.short}</span>
                <span class="exp-rail-org">${item.org}</span>
            </span>
        </button>
    `).join('');

    const select = (id) => {
        const item = EXPERIENCE.find((e) => e.id === id);
        if (!item) return;

        rail.querySelectorAll('.exp-rail-item').forEach((btn) => {
            const on = btn.dataset.expId === id;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        if (pathEl) pathEl.innerHTML = `~/career/<span>${item.file}</span>.log`;
        if (statusEl) statusEl.textContent = 'LOCKED';

        const render = () => {
            body.innerHTML = `
                <header>
                    <div class="exp-doss-kicker">Transmission // ${item.year}</div>
                    <h3 class="exp-doss-title">${item.title}</h3>
                    <p class="exp-doss-meta">${item.meta}</p>
                </header>
                <p class="exp-doss-summary">${item.summary}</p>
                <div class="exp-telemetry">
                    ${item.telemetry.map((t) => `
                        <div class="exp-tel">
                            <span class="exp-tel-label">${t.label}</span>
                            <span class="exp-tel-value">${t.value}</span>
                        </div>
                    `).join('')}
                </div>
                <div>
                    <div class="exp-block-label">Mission Log</div>
                    <ul class="exp-log">
                        ${item.log.map((l) => `<li><span><strong>${l.tag}</strong> — ${l.text}</span></li>`).join('')}
                    </ul>
                </div>
                <div>
                    <div class="exp-block-label">Signal Strength</div>
                    <div class="exp-signals">
                        ${item.signals.map((s) => `
                            <div class="exp-signal">
                                <span class="exp-signal-name">${s.name}</span>
                                <div class="exp-signal-track"><div class="exp-signal-fill" data-pct="${s.pct}"></div></div>
                                <span class="exp-signal-pct">${s.pct}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <div class="exp-block-label">Tags</div>
                    <div class="exp-chips">${item.tags.map((t) => `<span>${t}</span>`).join('')}</div>
                </div>
            `;
            body.classList.remove('is-swapping');
            // restart enter animation
            body.style.animation = 'none';
            // eslint-disable-next-line no-unused-expressions
            body.offsetHeight;
            body.style.animation = '';
            requestAnimationFrame(() => {
                body.querySelectorAll('.exp-signal-fill').forEach((fill) => {
                    fill.style.width = prefs.reduceMotion ? `${fill.dataset.pct}%` : '0%';
                    requestAnimationFrame(() => {
                        fill.style.width = `${fill.dataset.pct}%`;
                    });
                });
            });
        };

        if (prefs.reduceMotion) {
            render();
            return;
        }
        body.classList.add('is-swapping');
        setTimeout(render, 160);
    };

    rail.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-exp-id]');
        if (btn) select(btn.dataset.expId);
    });

    rail.addEventListener('keydown', (e) => {
        const items = [...rail.querySelectorAll('.exp-rail-item')];
        const idx = items.findIndex((el) => el.classList.contains('is-active'));
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const next = items[(idx + 1) % items.length];
            next.focus();
            select(next.dataset.expId);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = items[(idx - 1 + items.length) % items.length];
            prev.focus();
            select(prev.dataset.expId);
        }
    });

    select(EXPERIENCE[0].id);
}

function initFuelTilt() {
    const cards = document.querySelectorAll('.fuel-svc');
    if (!cards.length || prefs.reduceMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
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
    const section = document.getElementById('stack');
    const system = document.getElementById('solar-system');
    const planets = [...document.querySelectorAll('.planet')];
    const orbit = document.getElementById('stack-orbit');
    const grid = document.getElementById('stack-grid');
    const toggleBtns = document.querySelectorAll('.view-toggle-btn');
    const pop = document.getElementById('planet-pop');
    const popTitle = document.getElementById('planet-pop-title');
    const popKicker = document.getElementById('planet-pop-kicker');
    const popLevel = document.getElementById('planet-pop-level');
    const popChips = document.getElementById('planet-pop-chips');
    const popMeter = document.getElementById('planet-pop-meter');
    const popClose = document.getElementById('planet-pop-close');
    if (!system || !planets.length) return;

    if (prefs.reduceMotion) {
        system.classList.add('reduce-motion');
        section?.classList.add('is-lit');
    } else if (section) {
        const io = new IntersectionObserver((entries, o) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                section.classList.add('is-lit');
                o.unobserve(entry.target);
            });
        }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
        io.observe(section);
    }

    const PLANET_PAYLOAD = {
        languages: {
            title: 'Languages',
            level: 'Expert · 88%',
            pct: 88,
            items: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'SQL', 'PHP'],
        },
        frameworks: {
            title: 'Frameworks',
            level: 'Advanced · 84%',
            pct: 84,
            items: ['Next.js', 'Node.js', 'Express', 'ASP.NET Core', 'Tkinter'],
        },
        databases: {
            title: 'Databases',
            level: 'Proficient · 78%',
            pct: 78,
            items: ['MySQL', 'MongoDB', 'NeDB'],
        },
        ai: {
            title: 'AI & Product',
            level: 'Advanced · 80%',
            pct: 80,
            items: ['OpenAI API', 'Chatbots', 'Photo Recognition', 'Analytics'],
        },
        engineering: {
            title: 'Engineering',
            level: 'Expert · 86%',
            pct: 86,
            items: ['REST APIs', 'WebSockets', 'System Design', 'Accessibility'],
        },
        craft: {
            title: 'Craft',
            level: 'Advanced · 82%',
            pct: 82,
            items: ['UI/UX', 'Design Systems', 'Performance', 'Docs'],
        },
    };

    const closePop = () => {
        if (!pop) return;
        pop.classList.remove('is-open');
        pop.hidden = true;
        planets.forEach((p) => {
            p.setAttribute('aria-pressed', 'false');
            p.classList.remove('is-paused');
            p.closest('.orbit-ring')?.classList.remove('is-hot');
        });
    };

    const openPop = (id) => {
        const data = PLANET_PAYLOAD[id];
        if (!data || !pop) return;
        planets.forEach((p) => {
            const on = p.dataset.id === id;
            p.setAttribute('aria-pressed', String(on));
            p.classList.toggle('is-paused', on);
            p.closest('.orbit-ring')?.classList.toggle('is-hot', on);
        });
        if (popKicker) popKicker.textContent = 'Planet payload';
        if (popTitle) popTitle.textContent = data.title;
        if (popLevel) popLevel.textContent = data.level;
        if (popChips) {
            popChips.innerHTML = data.items.map((item) => `<span class="chip">${item}</span>`).join('');
        }
        if (popMeter) {
            popMeter.style.width = '0%';
            requestAnimationFrame(() => {
                popMeter.style.width = `${data.pct}%`;
            });
        }
        pop.hidden = false;
        // eslint-disable-next-line no-unused-expressions
        pop.offsetHeight;
        pop.classList.add('is-open');
    };

    planets.forEach((planet) => {
        const ring = planet.closest('.orbit-ring');
        planet.addEventListener('mouseenter', () => {
            if (prefs.reduceMotion) return;
            planet.classList.add('is-paused');
            ring?.classList.add('is-hot');
        });
        planet.addEventListener('mouseleave', () => {
            if (planet.getAttribute('aria-pressed') === 'true') return;
            planet.classList.remove('is-paused');
            ring?.classList.remove('is-hot');
        });
        planet.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = planet.dataset.id;
            if (planet.getAttribute('aria-pressed') === 'true' && pop && !pop.hidden) {
                closePop();
                return;
            }
            openPop(id);
        });
    });

    popClose?.addEventListener('click', (e) => {
        e.stopPropagation();
        closePop();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pop && !pop.hidden) closePop();
    });

    orbit?.addEventListener('click', (e) => {
        if (e.target.closest('.planet') || e.target.closest('#planet-pop')) return;
        if (pop && !pop.hidden) closePop();
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
        if (!isOrbit) closePop();
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
