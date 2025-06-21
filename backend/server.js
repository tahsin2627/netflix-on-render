// server.js (Final Rewritten Version)

const express = require('express');
const cors = require('cors');
const { connectToDb } = require('./db.js');
const postsRouter = require('./routes/posts.js'); // Import our new posts router

const app = express();
const PORT = process.env.PORT || 10000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ROUTER ---
// Any request starting with /api will be handled by our postsRouter
app.use('/api', postsRouter); 

// --- SERVER START ---
// Start the database connection first, then start the server.
connectToDb().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
