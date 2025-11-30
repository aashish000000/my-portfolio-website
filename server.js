// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const axios = require('axios');
const fs = require('fs/promises');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;
const PROJECT_CACHE_TTL = 1000 * 60 * 10; // 10 minutes
const STATIC_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
const PROJECTS_FALLBACK_PATH = path.join(__dirname, 'projects.json');
const DEFAULT_PINNED_REPOS = ['Expense-Splitter', 'CS230-Stock_Price'];
const PINNED_REPOS = (() => {
    const raw = process.env.PINNED_REPOS;
    if (!raw || !raw.trim()) {
        return DEFAULT_PINNED_REPOS;
    }
    return raw
        .split(',')
        .map((repo) => repo.trim())
        .filter(Boolean);
})();
const PINNED_REPO_SET = new Set(PINNED_REPOS.map((repo) => repo.toLowerCase()));
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'aashish000000';
const GITHUB_REQUEST_TIMEOUT = 1000 * 10; // 10 seconds
let projectCache = { data: null, expiresAt: 0 };

// --- Middleware ---
app.use(cors());
app.use(compression());
app.use(express.json());
app.set('etag', 'strong');
app.use(
    express.static(__dirname, {
        maxAge: STATIC_CACHE_MAX_AGE,
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
            }
        }
    })
);
app.use('/img', express.static(path.join(__dirname, 'img'), { maxAge: STATIC_CACHE_MAX_AGE }));


// --- API & Page Routes ---

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// GitHub Projects API Endpoint
app.get('/api/github-projects', async (req, res) => {
    try {
        const projects = await getProjectListing();
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.json(projects);
    } catch (error) {
        console.error('Error fetching GitHub projects:', error.message);
        res.status(500).json({ message: 'Failed to load project data. Please try again later.' });
    }
});


// Contact form submission endpoint
app.post('/api/send', (req, res) => {
    const { name, email, message } = req.body;
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({ message: 'Server configuration error.' });
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        subject: `New Portfolio Contact from ${name}`,
        text: `You have a new message from:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('--- NODEMAILER ERROR ---', error);
            return res.status(500).json({ message: 'Failed to send message.' });
        }
        res.status(200).json({ message: 'Message sent successfully! Thank you.' });
    });
});


// --- Start the Server ---
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
        console.log('View your live portfolio at: http://localhost:3000');
    });
}

module.exports = app;

async function getProjectListing() {
    if (projectCache.data && projectCache.expiresAt > Date.now()) {
        return projectCache.data;
    }

    const projects = await fetchProjectsWithFallback();
    projectCache = {
        data: projects,
        expiresAt: Date.now() + PROJECT_CACHE_TTL
    };

    return projects;
}

async function fetchProjectsWithFallback() {
    const githubToken = process.env.GITHUB_TOKEN;
    let projects = [];

    if (githubToken) {
        try {
            projects = await fetchProjectsFromGitHub(githubToken);
        } catch (error) {
            console.warn('GitHub API request failed, attempting fallback data:', error.message);
        }
    } else {
        console.warn('GitHub token not configured; attempting to serve cached or local project data.');
    }

    if (!projects.length) {
        projects = await readLocalProjectsFallback();
    }

    if (!projects.length) {
        throw new Error('Unable to load projects from GitHub or local fallback.');
    }

    return projects;
}

async function fetchProjectsFromGitHub(githubToken) {
    const response = await axios.get(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc`, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'portfolio-backend'
        },
        timeout: GITHUB_REQUEST_TIMEOUT
    });

    const repos = Array.isArray(response.data) ? response.data : [];
    const filteredRepos = PINNED_REPO_SET.size
        ? repos.filter((repo) => repo?.name && PINNED_REPO_SET.has(repo.name.toLowerCase()))
        : repos;

    return filteredRepos.map((repo) => ({
        id: repo.id,
        title: repo.name ? repo.name.replace(/[-_]/g, ' ') : 'Untitled project',
        description: repo.description || 'No description provided on GitHub.',
        githubUrl: repo.html_url,
        stars: repo.stargazers_count ?? 0,
        language: repo.language,
        createdAt: repo.created_at || null,
    }));
}

async function readLocalProjectsFallback() {
    try {
        const raw = await fs.readFile(PROJECTS_FALLBACK_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            throw new Error('projects.json must contain an array of projects.');
        }

        const normalizedProjects = parsed.map((project, index) => ({
            id: project.id ?? `local-${index}`,
            title: project.title || `Project ${index + 1}`,
            description: project.description || 'No description provided.',
            githubUrl: project.githubUrl || '#',
            stars: typeof project.stars === 'number' ? project.stars : 0,
            language: project.language || (Array.isArray(project.technologies) ? project.technologies[0] : null),
            createdAt: project.createdAt || null,
        }));

        const filteredProjects = filterProjectsByPinned(normalizedProjects);
        return filteredProjects.length ? filteredProjects : normalizedProjects;
    } catch (error) {
        console.error('Failed to load fallback projects file:', error.message);
        return [];
    }
}

function filterProjectsByPinned(projects = []) {
    if (!PINNED_REPO_SET.size) {
        return projects;
    }
    return projects.filter((project) => {
        const repoName = extractRepoNameFromUrl(project.githubUrl);
        return repoName && PINNED_REPO_SET.has(repoName);
    });
}

function extractRepoNameFromUrl(url = '') {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    const parts = trimmed.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1].toLowerCase() : '';
}

