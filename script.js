const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const runtimePrefs = {
    reduceMotion: reduceMotionQuery.matches,
    saveData: navigator.connection?.saveData ?? false,
};

if (reduceMotionQuery.addEventListener) {
    reduceMotionQuery.addEventListener('change', (event) => {
        runtimePrefs.reduceMotion = event.matches;
    });
} else if (reduceMotionQuery.addListener) {
    // Safari < 14 fallback
    reduceMotionQuery.addListener((event) => {
        runtimePrefs.reduceMotion = event.matches;
    });
}

const apiBases = (() => {
    const inlineBase = (document.body?.dataset?.apiBase || '').trim();
    if (inlineBase) {
        return ['', inlineBase];
    }
    return [''];
})();

let projectsLoaded = false;
let contactFormInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    initCore(runtimePrefs);
    setupLazyFeatures(runtimePrefs);
});

function initCore(prefs) {
    initCursorTrail(prefs);
    initHeaderScroll();
    initMobileMenu();
    initNavHighlighting();
    initTypingEffect(prefs);
    initAnimatedSections(prefs);
    updateYear();
}

function setupLazyFeatures(prefs) {
    const registry = new WeakMap();
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const callback = registry.get(entry.target);
                if (callback) {
                    callback();
                }
                obs.unobserve(entry.target);
            }
        });
    }, { rootMargin: '200px 0px', threshold: 0.1 });

    const register = (id, callback) => {
        const section = document.getElementById(id);
        if (!section) return;
        registry.set(section, callback);
        observer.observe(section);
    };

    register('about', () => initAboutCards(prefs));
    register('projects', () => initProjectsSection(prefs));
    register('contact', () => initContactForm());
}

function initCursorTrail({ reduceMotion }) {
    const cursorTrail = document.getElementById('cursor-trail');
    if (!cursorTrail || reduceMotion) return;

    let rafId = null;
    const pointer = { x: 0, y: 0 };

    window.addEventListener('mousemove', (event) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        if (rafId) return;

        rafId = requestAnimationFrame(() => {
            cursorTrail.style.left = `${pointer.x}px`;
            cursorTrail.style.top = `${pointer.y}px`;
            rafId = null;
        });
    });
}

function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    const toggleHeaderState = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', toggleHeaderState, { passive: true });
    toggleHeaderState();
}

function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenuButton || !mobileMenu) return;

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

function initNavHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('header nav a.nav-link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const currentSectionId = entry.target.getAttribute('id');
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
                });
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    sections.forEach((section) => observer.observe(section));
}

function initTypingEffect({ reduceMotion }) {
    const typingElement = document.getElementById('typing-effect');
    if (!typingElement) return;

    const words = [
        'Computer Science Student',
        'Aspiring Software Developer',
        'Full-Stack Enthusiast'
    ];

    if (reduceMotion) {
        typingElement.textContent = words[0];
        return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
        const currentWord = words[wordIndex];
        typingElement.textContent = currentWord.substring(0, charIndex);

        if (!isDeleting && charIndex < currentWord.length) {
            charIndex++;
        } else if (isDeleting && charIndex > 0) {
            charIndex--;
        } else {
            isDeleting = !isDeleting;
            if (!isDeleting) {
                wordIndex = (wordIndex + 1) % words.length;
            }
        }

        const reachedWordEnd = !isDeleting && charIndex === currentWord.length;
        const baseDelay = isDeleting ? 75 : 150;
        const delay = reachedWordEnd ? 1500 : baseDelay;
        setTimeout(type, delay);
    };

    type();
}

function initAnimatedSections({ reduceMotion }) {
    const animatedSections = document.querySelectorAll('.animated-section');
    if (!animatedSections.length) return;

    if (reduceMotion) {
        animatedSections.forEach((section) => section.classList.add('is-visible'));
        return;
    }

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    animatedSections.forEach((section) => animationObserver.observe(section));
}

function initAboutCards({ reduceMotion }) {
    if (reduceMotion) return;

    const aboutCards = document.querySelectorAll('.about-card');
    if (!aboutCards.length) return;

    aboutCards.forEach((card) => {
        const computedTransform = getComputedStyle(card).transform;
        const baseTransform = computedTransform === 'none' ? '' : computedTransform;
        let rafId = null;
        const tilt = { x: 0, y: 0 };

        const updateTilt = () => {
            card.style.transform = `perspective(1000px) ${baseTransform} rotateX(${-tilt.y / 15}deg) rotateY(${tilt.x / 15}deg) scale(1.08)`;
            rafId = null;
        };

        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            tilt.x = event.clientX - rect.left - rect.width / 2;
            tilt.y = event.clientY - rect.top - rect.height / 2;
            if (!rafId) {
                rafId = requestAnimationFrame(updateTilt);
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) ${baseTransform}`;
        });
    });
}

function initProjectsSection(prefs) {
    if (projectsLoaded) return;
    projectsLoaded = true;

    const projectGrid = document.getElementById('project-grid');
    const projectsLoader = document.getElementById('projects-loader');
    const projectsError = document.getElementById('projects-error');
    if (!projectGrid) return;

    if (prefs.saveData && projectsError) {
        if (projectsLoader) projectsLoader.style.display = 'none';
        projectsError.innerHTML = 'Projects skipped to save data. <button type=\"button\" class=\"project-retry text-cyan-400 underline\">Load anyway</button>';
        projectsError.classList.remove('hidden');
        const retryButton = projectsError.querySelector('.project-retry');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                projectsError.classList.add('hidden');
                loadProjects(projectGrid, projectsLoader, projectsError);
            }, { once: true });
        }
        return;
    }

    loadProjects(projectGrid, projectsLoader, projectsError);
}

async function loadProjects(projectGrid, projectsLoader, projectsError) {
    if (projectsError) {
        projectsError.textContent = '';
        projectsError.classList.add('hidden');
    }

    try {
        const projects = await fetchJsonWithFallback('/api/github-projects', {
            credentials: 'same-origin'
        });
        displayProjects(projects, projectGrid, projectsLoader);
    } catch (error) {
        console.error('Failed to load projects:', error);
        if (projectsLoader) projectsLoader.style.display = 'none';
        if (projectsError) {
            projectsError.innerHTML = `${error.message} <button type=\"button\" class=\"project-retry text-cyan-400 underline\">Retry</button>`;
            projectsError.classList.remove('hidden');
            const retryButton = projectsError.querySelector('.project-retry');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    projectsError.classList.add('hidden');
                    loadProjects(projectGrid, projectsLoader, projectsError);
                }, { once: true });
            }
        }
    }
}

function displayProjects(projects, projectGrid, projectsLoader) {
    if (projectsLoader) {
        projectsLoader.style.display = 'none';
    }
    if (!projectGrid) return;

    projectGrid.innerHTML = '';

    if (!projects || projects.length === 0) {
        projectGrid.innerHTML = '<p class="col-span-full text-center text-slate-400">No public projects found.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    projects.forEach((project) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'glass-card project-card interactive-element';
        const languagePill = project.language ? `<div class="project-language">${project.language}</div>` : '';

        projectCard.innerHTML = `
            <div class="card-content">
                <div class="project-header">
                    <h3 class="project-title">${project.title}</h3>
                    <div class="project-stats">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="star-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <span>${project.stars}</span>
                    </div>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-footer">
                    ${languagePill}
                    <a href="${project.githubUrl}" target="_blank" rel="noopener" class="project-link interactive-element">View on GitHub</a>
                </div>
            </div>`;

        fragment.appendChild(projectCard);
    });

    projectGrid.appendChild(fragment);
}

function initContactForm() {
    if (contactFormInitialized) return;
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    contactFormInitialized = true;

    contactForm.addEventListener('submit', async function handleSubmit(event) {
        event.preventDefault();
        const button = this.querySelector('button[type="submit"]');
        const formResponse = document.getElementById('form-response');
        if (!button || !formResponse) return;

        const originalButtonText = 'Send Message';
        button.disabled = true;
        button.innerHTML = '<svg class="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-width="4"></path></svg> Sending...';
        formResponse.textContent = '';
        formResponse.className = 'form-response';

        const payload = {
            name: this.name.value,
            email: this.email.value,
            message: this.message.value
        };

        try {
            const result = await fetchJsonWithFallback('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'same-origin'
            });

            formResponse.textContent = result?.message || 'Message sent successfully!';
            formResponse.classList.add('success');
            this.reset();
        } catch (error) {
            formResponse.textContent = error.message;
            formResponse.classList.add('error');
        } finally {
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    });
}

function updateYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

async function fetchJsonWithFallback(path, options = {}) {
    let lastError = null;

    for (const base of apiBases) {
        const url = `${base}${path}`;
        try {
            const response = await fetch(url, options);
            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');

            if (!response.ok) {
                let message = `Request failed with status ${response.status}`;
                if (isJson) {
                    try {
                        const errorPayload = await response.json();
                        if (errorPayload?.message) {
                            message = errorPayload.message;
                        }
                    } catch (_) {
                        // Swallow JSON parsing errors for failed responses
                    }
                }
                throw new Error(message);
            }

            return isJson ? response.json() : {};
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error('Unable to complete request.');
}
*** End of File