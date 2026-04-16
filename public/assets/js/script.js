/**
 * Aashish Joshi Portfolio — v3.0
 * ================================
 * Handles:
 *  - Navigation (scroll state, mobile menu, active links)
 *  - Hero typing animation
 *  - Scroll-triggered section reveals
 *  - GitHub projects loading with static fallback
 *  - Contact form submission
 *  - Dark / light theme toggle (persisted)
 *
 * @author Aashish Joshi
 */

// ─────────────────────────────────────────────
// Preferences
// ─────────────────────────────────────────────

const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefs = {
    reduceMotion: reduceMotionMQ.matches,
    saveData: navigator.connection?.saveData ?? false,
};

reduceMotionMQ.addEventListener?.('change', (e) => {
    prefs.reduceMotion = e.matches;
});

// ─────────────────────────────────────────────
// API Config
// ─────────────────────────────────────────────

const API_BASE = (document.body?.dataset?.apiBase || '').trim().replace(/\/+$/, '');
/** Same host as the Express app (local dev). Static hosts (Netlify) must call the backend URL first — never same-origin /api (wrong origin / HTML 200). */
const IS_LOCAL_API = /^localhost$|^127\.0\.0\.1$/i.test(window.location.hostname || '');
const API_BASES =
    !API_BASE ? [''] : IS_LOCAL_API ? ['', API_BASE] : [API_BASE];

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────

let projectsLoaded = false;
let contactFormReady = false;

// ─────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Signal to CSS that JS is running — enables reveal animations
    document.body.classList.add('js-ready');

    initTheme();
    initNav();
    initTyping();
    initReveal();
    updateFooterYear();
    setupLazyInit();
});

// ─────────────────────────────────────────────
// Theme (dark / light)
// ─────────────────────────────────────────────

function initTheme() {
    const root = document.documentElement;
    const btn = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') {
        root.setAttribute('data-theme', saved);
    }

    const syncLabel = () => {
        const t = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        btn?.setAttribute(
            'aria-label',
            t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        );
    };
    syncLabel();

    btn?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);
        syncLabel();
    });
}

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────

function initNav() {
    const header    = document.getElementById('header');
    const menuBtn   = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks  = document.querySelectorAll('header .nav-link');
    const sections  = document.querySelectorAll('main section[id]');

    // ── Scroll state ──────────────────────────
    const setHeaderScrolled = () => {
        header?.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', setHeaderScrolled, { passive: true });
    setHeaderScrolled();

    // ── Mobile menu ───────────────────────────
    menuBtn?.addEventListener('click', () => {
        const isOpen = mobileMenu?.classList.toggle('open');
        menuBtn.classList.toggle('open', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            menuBtn?.classList.remove('open');
            menuBtn?.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (
            mobileMenu?.classList.contains('open') &&
            !header?.contains(e.target)
        ) {
            mobileMenu.classList.remove('open');
            menuBtn?.classList.remove('open');
            menuBtn?.setAttribute('aria-expanded', 'false');
        }
    });

    // ── Active link highlighting ───────────────
    if (!navLinks.length || !sections.length) return;

    const linkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
        });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => linkObserver.observe(s));
}

// ─────────────────────────────────────────────
// Hero Typing Effect
// ─────────────────────────────────────────────

function initTyping() {
    const el = document.getElementById('typing-effect');
    if (!el) return;

    const words = [
        'NJCU Summer Intern',
        'Computer Science Student',
        'Aspiring Software Engineer',
        'Full-Stack Developer',
        'Problem Solver',
    ];

    if (prefs.reduceMotion) {
        el.textContent = words[0];
        return;
    }

    let wordIndex  = 0;
    let charIndex  = 0;
    let isDeleting = false;

    const tick = () => {
        const word = words[wordIndex];
        el.textContent = word.slice(0, charIndex);

        if (!isDeleting && charIndex < word.length) {
            charIndex++;
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
        } else if (!isDeleting && charIndex === word.length) {
            isDeleting = true;
        } else {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }

        const atWordEnd = !isDeleting && charIndex === word.length;
        const delay = atWordEnd ? 1800 : isDeleting ? 65 : 130;
        setTimeout(tick, delay);
    };

    tick();
}

// ─────────────────────────────────────────────
// Scroll Reveal
// ─────────────────────────────────────────────

function initReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (prefs.reduceMotion) {
        targets.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────────
// Lazy Section Init
// ─────────────────────────────────────────────

function setupLazyInit() {
    const sectionMap = new WeakMap();

    const lazyObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const fn = sectionMap.get(entry.target);
            fn?.();
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
    register('contact',  () => initContactForm());
}

// ─────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────

function initProjects() {
    if (projectsLoaded) return;
    projectsLoaded = true;

    const grid   = document.getElementById('project-grid');
    const loader = document.getElementById('projects-loader');
    const errEl  = document.getElementById('projects-error');
    if (!grid) return;

    // Save-data banner
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
        let projects;

        // Try API first
        try {
            projects = await jsonFetch('/api/github-projects', { credentials: 'same-origin' });
        } catch (_) {
            // Fallback to static file
            const res = await fetch('/projects.json');
            if (!res.ok) throw new Error('Could not load projects.');
            const raw = await res.json();
            projects = raw.map(p => ({
                id:          p.id,
                title:       p.title,
                description: p.description,
                githubUrl:   p.githubUrl,
                stars:       0,
                language:    p.technologies?.[0] || 'JavaScript',
            }));
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
        grid.innerHTML = '<p style="text-align:center;color:var(--text-3);grid-column:1/-1">No public projects found.</p>';
        return;
    }

    const frag = document.createDocumentFragment();

    projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';

        const lang   = p.language
            ? `<span class="project-lang">${escapeHtml(p.language)}</span>`
            : '';

        const stars  = `
            <span class="project-stars">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                ${p.stars ?? 0}
            </span>`;

        card.innerHTML = `
            <div class="project-card-top">
                <div class="project-repo-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/>
                    </svg>
                </div>
                ${stars}
            </div>
            <h3>${escapeHtml(p.title)}</h3>
            <p class="project-desc">${escapeHtml(p.description)}</p>
            <div class="project-footer">
                ${lang}
                <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="project-link">
                    View on GitHub
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/>
                    </svg>
                </a>
            </div>`;

        frag.appendChild(card);
    });

    grid.appendChild(frag);
}

// ─────────────────────────────────────────────
// Contact Form
// ─────────────────────────────────────────────

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

        // Loading state
        const originalHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="btn-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25" stroke-width="4"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-width="4"/>
            </svg>
            Sending…`;

        responseEl.textContent = '';
        responseEl.className = 'form-response';

        const payload = {
            name:    form.name.value.trim(),
            email:   form.email.value.trim(),
            message: form.message.value.trim(),
        };

        try {
            const result = await jsonFetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'same-origin',
            });
            responseEl.textContent = result?.message || 'Message sent! I'll be in touch soon.';
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

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────

function updateFooterYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}

/**
 * Fetch JSON with multi-base fallback (local → remote backend).
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function jsonFetch(path, options = {}) {
    let lastErr = null;

    for (const base of API_BASES) {
        const url = `${base}${path}`;
        try {
            const res = await fetch(url, options);
            const isJson = (res.headers.get('content-type') || '').includes('application/json');

            if (!res.ok) {
                let msg = `Request failed (${res.status})`;
                if (isJson) {
                    try {
                        const body = await res.json();
                        if (body?.message) msg = body.message;
                    } catch (_) { /* noop */ }
                }
                throw new Error(msg);
            }

            if (!isJson) {
                throw new Error('Invalid response from server.');
            }
            return res.json();
        } catch (err) {
            lastErr = err;
        }
    }

    throw lastErr ?? new Error('Request failed.');
}

/**
 * Minimal HTML escape for user-provided strings rendered via innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
