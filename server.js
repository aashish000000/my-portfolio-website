// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs/promises');
const axios = require('axios');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;
const PROJECT_CACHE_TTL = 1000 * 60 * 10; // 10 minutes
const STATIC_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
const PROJECTS_FILE_PATH = path.join(__dirname, 'projects.json');
const DEFAULT_PINNED_REPOS = ['Expense-Splitter', 'CS230-Stock_Price'];
const pinnedRepos = (process.env.PINNED_REPOS || '')
    .split(',')
    .map((repo) => repo.trim())
    .filter(Boolean);
const PINNED_REPO_LIST = pinnedRepos.length ? pinnedRepos : DEFAULT_PINNED_REPOS;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'aashish000000';
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

// Normalize project payloads to the shape required by the UI
function normalizeProject(project) {
    const fallbackTitle = 'Untitled Project';
    const inlineTitle = project.title || null;
    const repoName = project.name || null;
    const title = inlineTitle || (repoName ? repoName.replace(/[-_]/g, ' ') : fallbackTitle);

    return {
        id: project.id ?? project.githubUrl ?? project.html_url ?? title,
        title,
        description: project.description || 'No description provided on GitHub.',
        githubUrl: project.githubUrl || project.html_url || '#',
        stars: typeof project.stars === 'number'
            ? project.stars
            : (project.stargazers_count ?? 0),
        language: project.language
            || (Array.isArray(project.technologies) ? project.technologies[0] : null)
            || 'N/A',
        createdAt: project.createdAt || project.created_at || null,
    };
}

async function fetchProjectsFromGitHub() {
    const requestOptions = {};
    if (process.env.GITHUB_TOKEN) {
        requestOptions.headers = {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
        };
    }

    const { data } = await axios.get(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc`,
        requestOptions
    );

    const filteredRepos = PINNED_REPO_LIST.length
        ? data.filter((repo) => PINNED_REPO_LIST.includes(repo.name))
        : data;

    if (!filteredRepos.length) {
        throw new Error('No matching repositories found for the configured pinned list.');
    }

    return filteredRepos.map(normalizeProject);
}

async function fetchProjectsFromDisk() {
    const raw = await fs.readFile(PROJECTS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
        throw new Error('projects.json is not an array.');
    }

    return parsed.map(normalizeProject);
}

async function loadProjects() {
    try {
        const projects = await fetchProjectsFromGitHub();
        return { projects, source: 'github' };
    } catch (githubError) {
        console.warn('GitHub fetch failed, falling back to local projects:', githubError.message);
        const projects = await fetchProjectsFromDisk();
        if (!projects.length) {
            throw new Error('Local projects fallback returned no entries.');
        }
        return { projects, source: 'local' };
    }
}

// GitHub Projects API Endpoint
app.get('/api/github-projects', async (req, res) => {
    try {
        if (projectCache.data && projectCache.expiresAt > Date.now()) {
            res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
            return res.json(projectCache.data);
        }

        const { projects, source } = await loadProjects();

        projectCache = {
            data: projects,
            expiresAt: Date.now() + PROJECT_CACHE_TTL
        };

        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.set('X-Data-Source', source);
        res.json(projects);

    } catch (error) {
        console.error('Error fetching GitHub projects:', error.message);
        res.status(500).json({ message: 'Failed to fetch projects from GitHub or local cache.' });
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
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log('View your live portfolio at: http://localhost:3000');
});

