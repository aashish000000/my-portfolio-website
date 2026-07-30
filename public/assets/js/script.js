/**
 * Aashish Joshi — Portfolio (editorial / terminal aesthetic)
 * ==========================================================
 * Preloader · cursor glow · nav · counters · scroll reveals ·
 * skills bars · code-editor tabs · GitHub projects · contact form.
 *
 * @author Aashish Joshi
 */

const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefs = {
    reduceMotion: reduceMotionMQ.matches,
    saveData: navigator.connection?.saveData ?? false,
};
reduceMotionMQ.addEventListener?.('change', (e) => { prefs.reduceMotion = e.matches; });

// ── API config ─────────────────────────────────
const API_BASE = (document.body?.dataset?.apiBase || '').trim().replace(/\/+$/, '');
const IS_LOCAL_API = /^localhost$|^127\.0\.0\.1$/i.test(window.location.hostname || '');
const API_BASES = !API_BASE ? [''] : IS_LOCAL_API ? ['', API_BASE] : [API_BASE];

// ── State ──────────────────────────────────────
let projectsLoaded = false;
let contactFormReady = false;

// ── Boot ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    runPreloader();
    initCursorGlow();
    initNav();
    initResumeLinks();
    initReveal();
    initCounters();
    initSkillBars();
    initEditor();
    updateFooterYear();
    setupLazyInit();
});

// ── Preloader ──────────────────────────────────
function runPreloader() {
    const pre   = document.getElementById('preloader');
    const wordEl = document.getElementById('preloader-word');
    const langEl = document.getElementById('preloader-lang');
    const countEl = document.getElementById('preloader-count');
    const fillEl  = document.getElementById('preloader-fill');
    if (!pre) return;

    const greetings = [
        ['नमस्ते', 'Nepali'], ['Hello', 'English'], ['नमस्ते', 'Hindi'],
        ['Hola', 'Spanish'], ['Bonjour', 'French'], ['こんにちは', 'Japanese'],
    ];

    const finish = () => {
        document.body.classList.remove('no-scroll');
        pre.classList.add('done');
        document.body.classList.add('js-ready');
    };

    if (prefs.reduceMotion) {
        if (countEl) countEl.textContent = '100';
        if (fillEl) fillEl.style.width = '100%';
        setTimeout(finish, 300);
        return;
    }

    document.body.classList.add('no-scroll');

    let gi = 0;
    const cycle = setInterval(() => {
        gi = (gi + 1) % greetings.length;
        if (wordEl) wordEl.textContent = greetings[gi][0];
        if (langEl) langEl.textContent = greetings[gi][1];
    }, 260);

    let n = 0;
    const counter = setInterval(() => {
        n = Math.min(100, n + 4);
        if (countEl) countEl.textContent = String(n);
        if (fillEl) fillEl.style.width = `${n}%`;
        if (n >= 100) {
            clearInterval(counter);
            clearInterval(cycle);
            setTimeout(finish, 320);
        }
    }, 60);
}

// ── Cursor glow ────────────────────────────────
function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow || prefs.reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let x = 0, y = 0, cx = 0, cy = 0, raf = null;
    window.addEventListener('mousemove', (e) => {
        x = e.clientX; y = e.clientY;
        glow.classList.add('on');
        if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    const loop = () => {
        cx += (x - cx) * 0.14; cy += (y - cy) * 0.14;
        glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
        raf = (Math.abs(x - cx) > 0.5 || Math.abs(y - cy) > 0.5) ? requestAnimationFrame(loop) : null;
    };
}

// ── Navigation ─────────────────────────────────
function initNav() {
    const header  = document.getElementById('header');
    const menuBtn = document.getElementById('menu-toggle');
    const mobile  = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('#header .nav-link');
    const sections = document.querySelectorAll('main section[id]');

    const setScrolled = () => header?.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', setScrolled, { passive: true });
    setScrolled();

    menuBtn?.addEventListener('click', () => {
        const open = mobile?.classList.toggle('open');
        menuBtn.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('no-scroll', open);
    });
    mobile?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        mobile.classList.remove('open');
        menuBtn?.classList.remove('open');
        menuBtn?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
    }));

    if (!navLinks.length || !sections.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute('id');
            navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
        });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach(s => obs.observe(s));
}

// ── Resume links ───────────────────────────────
function initResumeLinks() {
    const resumePath = 'assets/docs/Aashish_Resume.pdf';
    const anchors = document.querySelectorAll('a[data-resume-link]');
    if (!anchors.length) return;
    const path = window.location.pathname || '/';
    const basePath = path.endsWith('/') ? path : `${path}/`;
    const href = `${window.location.origin}${basePath}${resumePath}`;
    anchors.forEach(a => a.setAttribute('href', href));
}

// ── Scroll reveal ──────────────────────────────
function initReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;
    if (prefs.reduceMotion) { targets.forEach(el => el.classList.add('visible')); return; }
    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            o.unobserve(entry.target);
        });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(el => obs.observe(el));
}

// ── Counters ───────────────────────────────────
function initCounters() {
    const nums = document.querySelectorAll('.stat-num[data-count]');
    if (!nums.length) return;
    if (prefs.reduceMotion) {
        nums.forEach(n => { n.textContent = `${n.dataset.count}${n.dataset.suffix || ''}`; });
        return;
    }
    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            countUp(entry.target);
            o.unobserve(entry.target);
        });
    }, { threshold: 0.4 });
    nums.forEach(n => obs.observe(n));
}
function countUp(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const dur = 1100; const start = performance.now();
    const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// ── Skill bars ─────────────────────────────────
function initSkillBars() {
    const cards = document.querySelectorAll('.skill-card');
    if (!cards.length) return;
    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            o.unobserve(entry.target);
        });
    }, { threshold: 0.3 });
    cards.forEach(c => obs.observe(c));
}

// ── Code editor / terminal ─────────────────────
function initEditor() {
    const tabs    = document.querySelectorAll('.editor-tab');
    const codeEl  = document.getElementById('editor-code');
    const gutter  = document.getElementById('editor-gutter');
    const badge   = document.getElementById('preview-badge');
    const preview = document.getElementById('preview-text');
    if (!tabs.length || !codeEl) return;

    // Each snippet is an array of LINES; each line is an array of [type, text] tokens.
    const snippets = {
        html: [
            [['tag', '<!DOCTYPE html>']],
            [['tag', '<html '], ['var', 'lang'], ['punc', '='], ['str', '"en"'], ['tag', '>']],
            [['tag', '  <body>']],
            [['tag', '    <h1>'], ['txt', 'Hello World!'], ['tag', '</h1>']],
            [['tag', '    <p>'], ['txt', "I'm Aashish — a full-stack developer."], ['tag', '</p>']],
            [['tag', '  </body>']],
            [['tag', '</html>']],
        ],
        js: [
            [['kw', 'const '], ['var', 'dev'], ['punc', ' = {']],
            [['punc', '  '], ['var', 'name'], ['punc', ': '], ['str', "'Aashish Joshi'"], ['punc', ',']],
            [['punc', '  '], ['var', 'role'], ['punc', ': '], ['str', "'Full-Stack Developer'"], ['punc', ',']],
            [['punc', '};']],
            [['com', '// ship it']],
            [['fn', 'console'], ['punc', '.'], ['fn', 'log'], ['punc', '('], ['str', "'Hello World!'"], ['punc', ');']],
        ],
        python: [
            [['kw', 'class '], ['fn', 'Developer'], ['punc', ':']],
            [['punc', '    '], ['var', 'name'], ['punc', ' = '], ['str', '"Aashish Joshi"']],
            [['punc', '    '], ['var', 'stack'], ['punc', ' = '], ['str', '"Python · JS · SQL"']],
            [['punc', '    '], ['kw', 'def '], ['fn', 'greet'], ['punc', '(self):']],
            [['punc', '        '], ['kw', 'return '], ['str', '"Hello World!"']],
            [['fn', 'print'], ['punc', '('], ['fn', 'Developer'], ['punc', '().'], ['fn', 'greet'], ['punc', '())']],
        ],
        java: [
            [['kw', 'public class '], ['fn', 'Main'], ['punc', ' {']],
            [['punc', '  '], ['kw', 'public static void'], ['fn', ' main'], ['punc', '(String[] args) {']],
            [['com', '    // Aashish Joshi']],
            [['punc', '    '], ['var', 'System'], ['punc', '.'], ['var', 'out'], ['punc', '.'], ['fn', 'println'], ['punc', '('], ['str', '"Hello World!"'], ['punc', ');']],
            [['punc', '  }']],
            [['punc', '}']],
        ],
    };

    const previewText = {
        html: "I'm Aashish — a full-stack developer.",
        js: "console.log('Hello World!') → shipped.",
        python: "Developer.greet() → Hello World!",
        java: "System.out.println → Hello World!",
    };

    const clsMap = { tag: 'tok-tag', str: 'tok-str', fn: 'tok-fn', kw: 'tok-kw', var: 'tok-var', num: 'tok-num', com: 'tok-com', punc: 'tok-punc', txt: '' };

    const renderLine = (line) => line.map(([type, text]) => {
        const cls = clsMap[type] ?? '';
        const safe = escapeHtml(text);
        return cls ? `<span class="${cls}">${safe}</span>` : safe;
    }).join('');

    let typing = null;
    const showLang = (lang) => {
        const lines = snippets[lang] || snippets.html;
        if (gutter) gutter.innerHTML = lines.map((_, i) => i + 1).join('<br>');
        if (badge) badge.textContent = lang;
        if (preview) preview.textContent = previewText[lang] || '';

        if (typing) clearTimeout(typing);
        if (prefs.reduceMotion) {
            codeEl.innerHTML = lines.map(renderLine).join('\n');
            return;
        }
        // Line-by-line reveal
        codeEl.innerHTML = '';
        let li = 0;
        const step = () => {
            if (li >= lines.length) return;
            codeEl.innerHTML = lines.slice(0, li + 1).map(renderLine).join('\n') + '<span class="caret">.</span>';
            li++;
            typing = setTimeout(step, 90);
        };
        step();
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showLang(tab.dataset.lang);
        });
    });

    // Start when the section scrolls into view
    const section = document.getElementById('terminal');
    if (section) {
        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                showLang('html');
                o.unobserve(entry.target);
            });
        }, { threshold: 0.25 });
        obs.observe(section);
    } else {
        showLang('html');
    }
}

// ── Lazy section init ──────────────────────────
function setupLazyInit() {
    const map = new WeakMap();
    const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            map.get(entry.target)?.();
            o.unobserve(entry.target);
        });
    }, { rootMargin: '200px 0px' });
    const register = (id, fn) => { const el = document.getElementById(id); if (el) { map.set(el, fn); obs.observe(el); } };
    register('projects', () => initProjects());
    register('contact',  () => initContactForm());
}

// ── Projects ───────────────────────────────────
function initProjects() {
    if (projectsLoaded) return;
    projectsLoaded = true;
    const grid   = document.getElementById('project-grid');
    const loader = document.getElementById('projects-loader');
    const errEl  = document.getElementById('projects-error');
    if (!grid) return;
    fetchProjects(grid, loader, errEl);
}

async function fetchProjects(grid, loader, errEl) {
    if (errEl) { errEl.textContent = ''; errEl.classList.add('hidden'); }
    if (loader) loader.style.display = 'flex';
    try {
        let projects;
        try {
            projects = await jsonFetch('/api/github-projects', { credentials: 'same-origin' });
        } catch (_) {
            const res = await fetch('/projects.json');
            if (!res.ok) throw new Error('Could not load projects.');
            const raw = await res.json();
            projects = raw.map(p => ({
                id: p.id, title: p.title, description: p.description, githubUrl: p.githubUrl,
                stars: 0, language: p.technologies?.[0] || 'JavaScript', technologies: p.technologies,
            }));
        }
        renderProjects(projects, grid, loader);
    } catch (err) {
        console.error('[projects]', err);
        if (loader) loader.style.display = 'none';
        if (errEl) {
            errEl.innerHTML = `${escapeHtml(err.message)} <button type="button" class="retry-btn">Retry</button>`;
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
        grid.innerHTML = '<p style="font-family:var(--mono);color:var(--muted);padding:24px 0">No public projects found.</p>';
        return;
    }
    const frag = document.createDocumentFragment();
    projects.forEach((p, i) => {
        const card = document.createElement('article');
        card.className = 'project-card';
        const num = String(i + 1).padStart(2, '0');
        const tech = (p.technologies && p.technologies.length)
            ? p.technologies : (p.language ? [p.language] : []);
        const techHtml = tech.map(t => `<span>${escapeHtml(t)}</span>`).join('');
        const href = (p.githubUrl && p.githubUrl !== '#') ? p.githubUrl : null;
        const cta = href
            ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/></svg></a>`
            : `<span class="project-link" style="color:var(--muted)">Private</span>`;
        const stars = p.stars ? `<span class="project-stars"><svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${p.stars}</span>` : '';
        card.innerHTML = `
            <div class="project-num">${num}</div>
            <div class="project-body">
                <h3>${escapeHtml(p.title)}</h3>
                <p class="project-tagline">${escapeHtml(tech[0] || 'Project')}</p>
                <p class="project-desc">${escapeHtml(p.description || 'No description provided.')}</p>
                <div class="project-tech">${techHtml}</div>
            </div>
            <div class="project-cta">${stars}${cta}</div>`;
        frag.appendChild(card);
    });
    grid.appendChild(frag);
}

// ── Contact form ───────────────────────────────
function initContactForm() {
    if (contactFormReady) return;
    const form = document.getElementById('contact-form');
    if (!form) return;
    contactFormReady = true;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn  = document.getElementById('form-submit-btn');
        const responseEl = document.getElementById('form-response');
        if (!submitBtn || !responseEl) return;

        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<svg class="btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke-opacity="0.25" stroke-width="4"/><path d="M12 2a10 10 0 0 1 10 10" stroke-width="4"/></svg> Sending…`;
        responseEl.textContent = '';
        responseEl.className = 'form-response';

        const subject = form.subject?.value.trim();
        const payload = {
            name:    form.name.value.trim(),
            email:   form.email.value.trim(),
            message: (subject ? `[${subject}] ` : '') + form.message.value.trim(),
        };

        try {
            const result = await jsonFetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'same-origin',
            });
            responseEl.textContent = result?.message || 'Message sent — I will be in touch soon.';
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

// ── Utilities ──────────────────────────────────
function updateFooterYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}

async function jsonFetch(path, options = {}) {
    let lastErr = null;
    for (const base of API_BASES) {
        const url = `${base}${path}`;
        try {
            const res = await fetch(url, options);
            const isJson = (res.headers.get('content-type') || '').includes('application/json');
            if (!res.ok) {
                let msg = `Request failed (${res.status})`;
                if (isJson) { try { const b = await res.json(); if (b?.message) msg = b.message; } catch (_) {} }
                throw new Error(msg);
            }
            if (!isJson) throw new Error('Invalid response from server.');
            return res.json();
        } catch (err) { lastErr = err; }
    }
    throw lastErr ?? new Error('Request failed.');
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
