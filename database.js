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
    description: { type: String },
    is_premium: { type: Boolean, default: false }
});

const commentSchema = new mongoose.Schema({
    video_id: { type: String, required: true },
    student_name: { type: String, required: true },
    comment_text: { type: String, required: true },
    date_posted: { type: Date, default: Date.now }
});

const noteSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    video_id: { type: String, required: true },
    note_text: { type: String, default: "" },
    updated_at: { type: Date, default: Date.now }
});

const testScoreSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    student_name: { type: String, required: true },
    subject: { type: String, required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    date_taken: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    stipend: { type: String, required: true },
    apply_link: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

// Create Mongoose Models
const Video = mongoose.model('Video', videoSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Note = mongoose.model('Note', noteSchema);
const TestScore = mongoose.model('TestScore', testScoreSchema);
const Job = mongoose.model('Job', jobSchema);

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_pro: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

async function seedData() {
    try {
        const count = await Video.countDocuments();
        if (count === 0) {
            console.log("Seeding initial video data...");
            
            const videos = [
                { title: "Machine learning|what is machine learning", youtube_id: "iVZFg84Ygks", category: "Machine Learning", description: "Introduction, definition and example in Kannada", is_premium: false },
                { title: "Why do we need ML|importance|popularity", youtube_id: "e4J9Lhnnbho", category: "Machine Learning", description: "Why Machine Learning became popular and its importance", is_premium: false },
                { title: "Knowledge pyramid|Machine Learning|DIKW model", youtube_id: "pAn_qQ2-ATE", category: "Machine Learning", description: "Data to Information to Knowledge to Wisdom in Kannada", is_premium: false },
                { title: "Artificial intelligence, neural network, deep learning", youtube_id: "yvwj1w0vk1k", category: "Machine Learning", description: "Relation of ML to other technologies", is_premium: false },
                { title: "How ML related to Data science, analytics, pattern recognition", youtube_id: "PeXv34yMDvo", category: "Machine Learning", description: "Important relationships in Data Science", is_premium: false },
                { title: "Types of Machine learning|fundamentals|basics", youtube_id: "nnLyVa_HeUY", category: "Machine Learning", description: "Core concepts and basics in EDU YODHA", is_premium: false },
                { title: "Supervised Learning|Types of Machine Learning", youtube_id: "_YPF5uwWttI", category: "Machine Learning", description: "Basic concepts of Supervised Learning", is_premium: false },
                { title: "Unsupervised learning|Types of Machine Learning", youtube_id: "tOgTJL4D1Ig", category: "Machine Learning", description: "Concepts and fundamentals of Unsupervised ML", is_premium: true },
                { title: "Semi-supervised and reinforcement learning", youtube_id: "ymDQ8hxbLT4", category: "Machine Learning", description: "Understanding Reinforcement and Semi-supervised ML", is_premium: true },
                { title: "Challenges of Machine Learning", youtube_id: "oYDKewCVmLY", category: "Machine Learning", description: "Overfitting, Underfitting, Bias & Variance", is_premium: true },
                { title: "CRISP-DM Process Explained", youtube_id: "eyWPaManDA4", category: "Machine Learning", description: "Simple Friendship Example | ML process", is_premium: true }
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

module.exports = { Video, Comment, User, Note, TestScore, Job };
