const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'eduyodha.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connected to the SQLite database.");
        
        // Create Videos Table
        db.run(`CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            youtube_id TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT
        )`, (err) => {
            if (err) {
                console.error("Error creating videos table: " + err.message);
            } else {
                console.log("Videos table ready.");
                
                // Create Comments Table
                db.run(`CREATE TABLE IF NOT EXISTS comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    video_id INTEGER NOT NULL,
                    student_name TEXT NOT NULL,
                    comment_text TEXT NOT NULL,
                    date_posted DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, (err) => {
                    if (err) console.error("Error creating comments table: " + err.message);
                    else console.log("Comments table ready.");
                });

                seedData(); // Populate initial videos
            }
        });
    }
});

function seedData() {
    db.get("SELECT COUNT(*) as count FROM videos", (err, row) => {
        if (!err && row.count === 0) {
            console.log("Seeding initial video data...");
            const stmt = db.prepare("INSERT INTO videos (title, youtube_id, category, description) VALUES (?, ?, ?, ?)");
            
            const videos = [
                ["Machine learning|what is machine learning", "iVZFg84Ygks", "Machine Learning", "Introduction, definition and example in Kannada"],
                ["Why do we need ML|importance|popularity", "e4J9Lhnnbho", "Machine Learning", "Why Machine Learning became popular and its importance"],
                ["Knowledge pyramid|Machine Learning|DIKW model", "pAn_qQ2-ATE", "Machine Learning", "Data to Information to Knowledge to Wisdom in Kannada"],
                ["Artificial intelligence, neural network, deep learning", "yvwj1w0vk1k", "Machine Learning", "Relation of ML to other technologies"],
                ["How ML related to Data science, analytics, pattern recognition", "PeXv34yMDvo", "Machine Learning", "Important relationships in Data Science"],
                ["Types of Machine learning|fundamentals|basics", "nnLyVa_HeUY", "Machine Learning", "Core concepts and basics in EDU YODHA"],
                ["Supervised Learning|Types of Machine Learning", "_YPF5uwWttI", "Machine Learning", "Basic concepts of Supervised Learning"],
                ["Unsupervised learning|Types of Machine Learning", "tOgTJL4D1Ig", "Machine Learning", "Concepts and fundamentals of Unsupervised ML"],
                ["Semi-supervised and reinforcement learning", "ymDQ8hxbLT4", "Machine Learning", "Understanding Reinforcement and Semi-supervised ML"],
                ["Challenges of Machine Learning", "oYDKewCVmLY", "Machine Learning", "Overfitting, Underfitting, Bias & Variance"],
                ["CRISP-DM Process Explained", "eyWPaManDA4", "Machine Learning", "Simple Friendship Example | ML process"]
            ];

            const newPlaylists = require('./playlist_output.json');
            const allVideos = [...videos, ...newPlaylists];

            allVideos.forEach(video => {
                stmt.run(video);
            });
            stmt.finalize();
            console.log("Seeding complete.");
        }
    });
}

module.exports = db;
