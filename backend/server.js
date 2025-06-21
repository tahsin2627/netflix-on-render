// server.js (Rewritten)

const express = require('express');
const cors = require('cors');
// Import our new database functions and the collection getter
const { connectToDb, getPostsCollection } = require('./db.js');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// Endpoint for the frontend to GET all posts
app.get('/api/posts', async (req, res) => {
    try {
        // Get the collection from our db module
        const posts = await getPostsCollection().find({}).sort({ _id: -1 }).toArray();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to retrieve posts.' });
    }
});

// Endpoint for the Telegram bot to POST a new post
app.post('/api/post-content', async (req, res) => {
    try {
        const newPost = req.body;

        // Validation for all the fields from your Telegram bot
        if (!newPost.title || !newPost.category || !newPost.poster || !newPost.description || !newPost.streamLink || !newPost.downloadLink) {
            return res.status(400).json({ error: 'Bad Request: Missing all required fields.' });
        }
        
        // Insert the new post document using the collection from our db module
        const result = await getPostsCollection().insertOne(newPost);
        
        res.status(200).json({ message: 'Content posted successfully!', insertedId: result.insertedId });
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ error: 'Failed to post content.' });
    }
});


// Start the database connection first, then start the server.
connectToDb().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
