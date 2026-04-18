const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { Video, Comment } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API to get all video categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Video.distinct('category');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to get videos (optional filter by category)
app.get('/api/videos', async (req, res) => {
    try {
        const category = req.query.category;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        const videos = await Video.find(query);
        // Map _id to id so frontend JS loop isn't broken
        const formattedVideos = videos.map(v => ({
            id: v._id.toString(),
            title: v.title,
            youtube_id: v.youtube_id,
            category: v.category,
            description: v.description
        }));
        res.json(formattedVideos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Comments for a video
app.get('/api/comments/:video_id', async (req, res) => {
    try {
        const comments = await Comment.find({ video_id: req.params.video_id })
                                      .sort({ date_posted: -1 });
        const formattedComments = comments.map(c => ({
            id: c._id.toString(),
            video_id: c.video_id,
            student_name: c.student_name,
            comment_text: c.comment_text,
            date_posted: c.date_posted
        }));
        res.json(formattedComments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new comment
app.post('/api/comments', async (req, res) => {
    const { video_id, student_name, comment_text } = req.body;
    if (!video_id || !comment_text) return res.status(400).json({ error: "Missing fields" });

    try {
        const newComment = await Comment.create({
            video_id,
            student_name: student_name || "Anonymous Student",
            comment_text
        });
        res.json({ id: newComment._id.toString(), success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`EDU YODHA server running on http://localhost:${PORT}`);
});
