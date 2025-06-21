// routes/posts.js (Updated)

const express = require('express');
const router = express.Router(); // Create a new router object
const { getPostsCollection } = require('../db'); // Note the '../' to go up one directory

// This route corresponds to GET /api/posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await getPostsCollection().find({}).sort({ _id: -1 }).toArray();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to retrieve posts.' });
    }
});

// This route corresponds to POST /api/post-content
router.post('/post-content', async (req, res) => {
    try {
        const newPost = req.body;

        if (!newPost.title || !newPost.category || !newPost.poster || !newPost.description || !newPost.streamLink || !newPost.downloadLink) {
            return res.status(400).json({ error: 'Bad Request: Missing all required fields.' });
        }
        
        const result = await getPostsCollection().insertOne(newPost);
        
        res.status(200).json({ message: 'Content posted successfully!', insertedId: result.insertedId });
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ error: 'Failed to post content.' });
    }
});

// New endpoint for statistics (GET /api/stats)
router.get('/stats', async (req, res) => {
    try {
        const postsCollection = getPostsCollection(); // Get the collection

        const totalPosts = await postsCollection.countDocuments({});
        const movieCount = await postsCollection.countDocuments({ category: 'Movie' });
        const seriesCount = await postsCollection.countDocuments({ category: 'Series' });

        res.json({
            total: totalPosts,
            movies: movieCount,
            series: seriesCount
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to retrieve stats.' });
    }
});


module.exports = router; // Export the router
