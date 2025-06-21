const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 10000;

// Get the MongoDB Connection String from the environment variables we set on Render
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

let db;
let postsCollection;

// Connect to the database when the server starts
async function connectToDb() {
    try {
        await client.connect();
        // You can name your database anything. 'myflix_database' is just an example.
        db = client.db('myflix_database'); 
        postsCollection = db.collection('posts');
        console.log('Successfully connected to MongoDB!');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); // Exit if we can't connect to the database
    }
}

app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// Endpoint for the frontend to GET all posts
app.get('/api/posts', async (req, res) => {
    try {
        // Find all posts, sort by most recent, and convert to an array
        const posts = await postsCollection.find({}).sort({_id: -1}).toArray();
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
        
        // Insert the new post document into the 'posts' collection in MongoDB
        const result = await postsCollection.insertOne(newPost);
        
        res.status(200).json({ message: 'Content posted successfully!', insertedId: result.insertedId });
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ error: 'Failed to post content.' });
    }
});

// Start the server only after connecting to the database
connectToDb().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
