const express = require('express');
const cors = require('cors');
const validUrl = require('valid-url');
const { v4: uuidv4 } = require('uuid');
const app = express();

require('dotenv').config();

// In-memory storage (replace with database for production)
const urlMap = new Map();
const apiKeys = new Set([process.env.API_KEY]);

app.use(cors());
app.use(express.json());

// URL shortening endpoint
app.get('/api/create', (req, res) => {
    const apiKey = req.query.api;
    const longUrl = req.query.url;

    if (!apiKeys.has(apiKey)) {
        return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!validUrl.isUri(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    const shortCode = uuidv4().substring(0, 8);
    const shortUrl = `${process.env.DOMAIN}/s/${shortCode}`;
    
    urlMap.set(shortCode, {
        longUrl,
        createdAt: new Date()
    });

    res.json({ shortUrl });
});

// Redirect endpoint
app.get('/s/:code', (req, res) => {
    const code = req.params.code;
    const entry = urlMap.get(code);

    if (entry) {
        res.redirect(`${process.env.BLOGGER_URL}/?target=${encodeURIComponent(entry.longUrl)}`);
    } else {
        res.status(404).send('URL not found');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
