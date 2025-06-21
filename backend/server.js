const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const postsFilePath = path.join(__dirname, 'posts.json');

app.use(cors());
app.use(express.json());

// Endpoint for the frontend to GET all posts
app.get('/api/posts', async (req, res) => {
    try {
        const data = await fs.readFile(postsFilePath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading posts file:', error);
        res.status(500).json({ error: 'Failed to retrieve posts.' });
    }
});

// Endpoint for the Telegram bot to POST a new post
app.post('/api/post-content', async (req, res) => {
    try {
        const newPost = req.body;

        if (!newPost.title || !newPost.category || !newPost.poster || !newPost.description) {
            return res.status(400).json({ error: 'Bad Request: Missing required fields.' });
        }

        const currentPostsData = await fs.readFile(postsFilePath, 'utf-8');
        const currentPosts = JSON.parse(currentPostsData);

        currentPosts.unshift(newPost); // Add to the beginning

        await fs.writeFile(postsFilePath, JSON.stringify(currentPosts, null, 2));

        res.status(200).json({ message: 'Content posted successfully!' });
    } catch (error) {
        console.error('Error writing to posts file:', error);
        res.status(500).json({ error: 'Failed to post content.' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
