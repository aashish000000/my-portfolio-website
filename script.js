document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio script loaded and running!");

    // --- Original Page Scripts (Fully Merged) ---

    // Cursor Trail
    const cursorTrail = document.getElementById('cursor-trail');
    if (cursorTrail) {
        window.addEventListener('mousemove', e => {
            cursorTrail.style.left = `${e.clientX}px`;
            cursorTrail.style.top = `${e.clientY}px`;
        });
    }

    // Header Scroll Effect
    const header = document.getElementById('header');
    if(header){
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        document.querySelectorAll('#mobile-menu a, nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            });
        });
    }
    
    // Active Nav Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('header nav a.nav-link');
    if (sections.length > 0 && navLinks.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentSectionId = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${currentSectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.4 });
        sections.forEach(section => observer.observe(section));
    }

    // Typing Effect
    const typingElement = document.getElementById('typing-effect');
    if (typingElement) {
        const words = ["Computer Science Student", "Aspiring Software Developer", "Full-Stack Enthusiast"];
        let wordIndex = 0, charIndex = 0, isDeleting = false;
        function type() {
            const currentWord = words[wordIndex];
            const typeSpeed = isDeleting ? 75 : 150;
            typingElement.textContent = currentWord.substring(0, charIndex);
            
            if (!isDeleting && charIndex < currentWord.length) {
                charIndex++;
                setTimeout(type, typeSpeed);
            } else if (isDeleting && charIndex > 0) {
                charIndex--;
                setTimeout(type, typeSpeed);
            } else {
                isDeleting = !isDeleting;
                if (!isDeleting) {
                    wordIndex = (wordIndex + 1) % words.length;
                }
                setTimeout(type, isDeleting ? 1500 : 500);
            }
        }
        type();
    }
    
    // 3D Tilt Effect for About Cards
    const aboutCards = document.querySelectorAll('.about-card');
    aboutCards.forEach(card => {
        const initialTransform = getComputedStyle(card).transform;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            card.style.transform = `perspective(1000px) ${initialTransform} rotateX(${-y / 15}deg) rotateY(${x / 15}deg) scale(1.1)`;
        });
        card.addEventListener('mouseleave', () => {
             card.style.transform = `perspective(1000px) ${initialTransform}`;
        });
    });

    // Animate on Scroll for Sections
    const animatedSections = document.querySelectorAll('.animated-section');
    if (animatedSections.length > 0) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        animatedSections.forEach(section => animationObserver.observe(section));
    }


    // --- Advanced Features ---

    // Load Projects from GitHub API
    const projectGrid = document.getElementById('project-grid');
    const projectsLoader = document.getElementById('projects-loader');
    const projectsError = document.getElementById('projects-error');

    async function loadProjects() {
        if (!projectGrid) return;
        try {
            const response = await fetch('https://aashish-portfolio-backend.onrender.com/api/github-projects');
            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
            }
            const projects = await response.json();
            displayProjects(projects);
        } catch (error) {
            console.error("Failed to load projects:", error);
            if (projectsLoader) projectsLoader.style.display = 'none';
            if (projectsError) {
                projectsError.textContent = error.message;
                projectsError.style.display = 'block';
            }
        }
    }

    // Display Projects with GitHub Data
    function displayProjects(projects) {
        if (!projectGrid || !projectsLoader) return;
        projectGrid.innerHTML = '';
        if (projectsLoader) projectsLoader.style.display = 'none';

        if (projects.length === 0) {
            projectGrid.innerHTML = `<p class="col-span-full text-center text-slate-400">No public projects with descriptions found on GitHub.</p>`;
            return;
        }

        projects.forEach(project => {
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
                        <a href="${project.githubUrl}" target="_blank" class="project-link interactive-element">View on GitHub</a>
                    </div>
                </div>`;
            projectGrid.appendChild(projectCard);
        });
    }

    loadProjects();
    
    // Contact Form Logic
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const button = this.querySelector('button[type="submit"]');
            const originalButtonText = "Send Message";
            const formResponse = document.getElementById('form-response');

            button.disabled = true;
            button.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-width="4"></path></svg> Sending...`;
            formResponse.textContent = '';
            formResponse.className = 'form-response';

            const formData = { name: this.name.value, email: this.email.value, message: this.message.value };

            try {
                const response = await fetch('https://aashish-portfolio-backend.onrender.com/api/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'An unknown error occurred.');
                
                formResponse.textContent = result.message;
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

    // Year in footer
    const yearSpan = document.getElementById('year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

