const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API to get all video categories
app.get('/api/categories', (req, res) => {
    db.all("SELECT DISTINCT category FROM videos", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(row => row.category));
    });
});

// API to get videos (optional filter by category)
app.get('/api/videos', (req, res) => {
    const category = req.query.category;
    let query = "SELECT * FROM videos";
    let params = [];

    if (category && category !== 'All') {
        query += " WHERE category = ?";
        params.push(category);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET Comments for a video
app.get('/api/comments/:video_id', (req, res) => {
    db.all("SELECT * FROM comments WHERE video_id = ? ORDER BY date_posted DESC", [req.params.video_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST a new comment
app.post('/api/comments', (req, res) => {
    const { video_id, student_name, comment_text } = req.body;
    if (!video_id || !comment_text) return res.status(400).json({ error: "Missing fields" });

    db.run("INSERT INTO comments (video_id, student_name, comment_text) VALUES (?, ?, ?)", 
        [video_id, student_name || "Anonymous Student", comment_text], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, success: true });
    });
});

app.listen(PORT, () => {
    console.log(`EDU YODHA server running on http://localhost:${PORT}`);
});
