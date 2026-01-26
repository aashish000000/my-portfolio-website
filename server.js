/**
 * Portfolio Website Backend Server
 * ================================
 * Express server handling:
 *  - Static file serving with caching
 *  - GitHub API integration for live projects
 *  - Contact form email delivery via Nodemailer
 * 
 * @author Aashish Joshi
 * @version 1.0.0
 */

require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const axios = require('axios');

// =====================
// Server Configuration
// =====================

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_PATH = path.join(DATA_DIR, 'projects.json');

/** Cache TTL for GitHub projects (10 minutes) */
const PROJECT_CACHE_TTL = 1000 * 60 * 10;

/** Max-age for static assets (7 days) */
const STATIC_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;

/** In-memory cache for GitHub projects */
let projectCache = { data: null, expiresAt: 0 };

// ==============
// Middleware
// ==============

app.use(cors());                     // Enable CORS for all origins
app.use(compression());               // Gzip compression for responses
app.use(express.json());              // Parse JSON request bodies
app.set('etag', 'strong');            // Strong ETag for cache validation

// Static file serving with optimized caching
app.use(
    express.static(PUBLIC_DIR, {
        maxAge: STATIC_CACHE_MAX_AGE,
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
            // HTML files should always be revalidated
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
            }
        }
    })
);

// Image assets with long cache duration
app.use('/assets/img', express.static(path.join(PUBLIC_DIR, 'assets', 'img'), { maxAge: STATIC_CACHE_MAX_AGE }));


// ================
// API Routes
// ================

/**
 * Root Route - Serves the main portfolio page
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

/**
 * GET /api/github-projects
 * Fetches pinned GitHub repositories with caching
 * Falls back to projects.json if GitHub API fails
 */
app.get('/api/github-projects', async (req, res) => {
    try {
        if (projectCache.data && projectCache.expiresAt > Date.now()) {
            res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
            return res.json(projectCache.data);
        }

        const githubToken = process.env.GITHUB_TOKEN;
        const username = 'aashish000000'; // Your GitHub username

        // ** UPDATED: Define which specific repositories you want to show **
        const pinnedRepos = ['final-project-calorie-calculator', 'Calorie_Calculator', 'Expense-Splitter', 'CS230-Stock_Price'];

        // If no GitHub token, fall back to local projects.json
        if (!githubToken) {
            console.log('No GitHub token configured. Using local projects.json');
            const fs = require('fs');
            const localProjects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
            const projects = localProjects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                githubUrl: p.githubUrl,
                stars: 0,
                language: p.technologies?.[0] || 'JavaScript',
            }));
            
            projectCache = {
                data: projects,
                expiresAt: Date.now() + PROJECT_CACHE_TTL
            };
            
            res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
            return res.json(projects);
        }

        const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc`, {
            headers: {
                'Authorization': `token ${githubToken}`
            }
        });

        // Filter and map the data to a clean format
        const projects = response.data
            // ** UPDATED: The filter now only includes repos from your pinnedRepos list **
            .filter(repo => pinnedRepos.includes(repo.name))
            .map(repo => ({
                id: repo.id,
                title: repo.name.replace(/[-_]/g, ' '), // Make title readable
                description: repo.description || 'No description provided on GitHub.', // Add a fallback
                githubUrl: repo.html_url,
                stars: repo.stargazers_count,
                language: repo.language,
                createdAt: repo.created_at,
            }));

        projectCache = {
            data: projects,
            expiresAt: Date.now() + PROJECT_CACHE_TTL
        };

        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.json(projects);

    } catch (error) {
        console.error('Error fetching GitHub projects:', error.message);
        // Fall back to local projects.json on any error
        try {
            const fs = require('fs');
            const localProjects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf8'));
            const projects = localProjects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                githubUrl: p.githubUrl,
                stars: 0,
                language: p.technologies?.[0] || 'JavaScript',
            }));
            res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
            return res.json(projects);
        } catch (fallbackError) {
            console.error('Fallback to projects.json also failed:', fallbackError.message);
            res.status(500).json({ message: 'Failed to fetch projects.' });
        }
    }
});


/**
 * POST /api/send
 * Handles contact form submissions via Nodemailer
 * Requires EMAIL_USER and EMAIL_PASS environment variables
 */
app.post('/api/send', (req, res) => {
    const { name, email, message } = req.body;

    // Validate server configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    // Configure Gmail transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    // Compose email
    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER,
        subject: `New Portfolio Contact from ${name}`,
        text: `You have a new message from:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('--- NODEMAILER ERROR ---', error);
            return res.status(500).json({ message: 'Failed to send message.' });
        }
        res.status(200).json({ message: 'Message sent successfully! Thank you.' });
    });
});

// ================
// Start Server
// ================

app.listen(PORT, () => {
    console.log(`\n🚀 Portfolio server running!`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: Check your IP for external access\n`);
});

