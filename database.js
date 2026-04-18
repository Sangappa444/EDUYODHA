const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/eduyodha_local";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB database.");
    seedData(); // Populate initial videos if collection is empty
  })
  .catch(err => {
    console.error("Error connecting to MongoDB: ", err.message);
  });

// Create Mongoose Schemas
const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    youtube_id: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String }
});

const commentSchema = new mongoose.Schema({
    video_id: { type: String, required: true },
    student_name: { type: String, required: true },
    comment_text: { type: String, required: true },
    date_posted: { type: Date, default: Date.now }
});

// Create Mongoose Models
const Video = mongoose.model('Video', videoSchema);
const Comment = mongoose.model('Comment', commentSchema);

async function seedData() {
    try {
        const count = await Video.countDocuments();
        if (count === 0) {
            console.log("Seeding initial video data...");
            
            const videos = [
                { title: "Machine learning|what is machine learning", youtube_id: "iVZFg84Ygks", category: "Machine Learning", description: "Introduction, definition and example in Kannada" },
                { title: "Why do we need ML|importance|popularity", youtube_id: "e4J9Lhnnbho", category: "Machine Learning", description: "Why Machine Learning became popular and its importance" },
                { title: "Knowledge pyramid|Machine Learning|DIKW model", youtube_id: "pAn_qQ2-ATE", category: "Machine Learning", description: "Data to Information to Knowledge to Wisdom in Kannada" },
                { title: "Artificial intelligence, neural network, deep learning", youtube_id: "yvwj1w0vk1k", category: "Machine Learning", description: "Relation of ML to other technologies" },
                { title: "How ML related to Data science, analytics, pattern recognition", youtube_id: "PeXv34yMDvo", category: "Machine Learning", description: "Important relationships in Data Science" },
                { title: "Types of Machine learning|fundamentals|basics", youtube_id: "nnLyVa_HeUY", category: "Machine Learning", description: "Core concepts and basics in EDU YODHA" },
                { title: "Supervised Learning|Types of Machine Learning", youtube_id: "_YPF5uwWttI", category: "Machine Learning", description: "Basic concepts of Supervised Learning" },
                { title: "Unsupervised learning|Types of Machine Learning", youtube_id: "tOgTJL4D1Ig", category: "Machine Learning", description: "Concepts and fundamentals of Unsupervised ML" },
                { title: "Semi-supervised and reinforcement learning", youtube_id: "ymDQ8hxbLT4", category: "Machine Learning", description: "Understanding Reinforcement and Semi-supervised ML" },
                { title: "Challenges of Machine Learning", youtube_id: "oYDKewCVmLY", category: "Machine Learning", description: "Overfitting, Underfitting, Bias & Variance" },
                { title: "CRISP-DM Process Explained", youtube_id: "eyWPaManDA4", category: "Machine Learning", description: "Simple Friendship Example | ML process" }
            ];

            let newPlaylists = [];
            try {
                const fs = require('fs');
                if (fs.existsSync(require('path').resolve(__dirname, 'playlist_output.json'))) {
                    const rawData = require('./playlist_output.json');
                    newPlaylists = rawData.map(item => ({
                        title: item[0],
                        youtube_id: item[1],
                        category: item[2],
                        description: item[3]
                    }));
                }
            } catch (e) {
                console.error("Could not load playlist_output.json:", e);
            }

            const allVideos = [...videos, ...newPlaylists];
            
            await Video.insertMany(allVideos);
            console.log("Seeding complete.");
        }
    } catch (err) {
        console.error("Error during seeding:", err);
    }
}

module.exports = { Video, Comment };
