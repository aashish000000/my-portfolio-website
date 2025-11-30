// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const axios = require('axios');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;
const PROJECT_CACHE_TTL = 1000 * 60 * 10; // 10 minutes
const STATIC_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
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
        if (projectCache.data && projectCache.expiresAt > Date.now()) {
            res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
            return res.json(projectCache.data);
        }

        const githubToken = process.env.GITHUB_TOKEN;
        const username = 'aashish000000'; // Your GitHub username

        // ** UPDATED: Define which specific repositories you want to show **
        const pinnedRepos = ['Expense-Splitter', 'CS230-Stock_Price'];

        // If no GitHub token, fall back to local projects.json
        if (!githubToken) {
            console.log('No GitHub token configured. Using local projects.json');
            const fs = require('fs');
            const localProjects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));
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
            const localProjects = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf8'));
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

