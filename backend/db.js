// db.js

const { MongoClient } = require('mongodb');

// Get the MongoDB Connection String from the environment variables
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set.');
}

const client = new MongoClient(mongoUri);

let db;
let postsCollection;

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

// This function allows other files to get the collection object
function getPostsCollection() {
    return postsCollection;
}

module.exports = { connectToDb, getPostsCollection };
