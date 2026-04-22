const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { Video, Comment, User } = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

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
            description: v.description,
            is_premium: v.is_premium || false
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

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword });
        
        const token = jwt.sign({ id: newUser._id, is_pro: newUser.is_pro }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { name: newUser.name, email: newUser.email, is_pro: newUser.is_pro } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, is_pro: user.is_pro }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { name: user.name, email: user.email, is_pro: user.is_pro } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ user });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

// AI Mock Test Generator
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/mocktest/generate', async (req, res) => {
    const { subject, chapter } = req.body;
    if (!subject || !chapter) return res.status(400).json({ error: "Missing subject or chapter" });

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Generate exactly 15 multiple choice questions for KCET exam preparation.
        Subject: ${subject}
        Chapter: ${chapter}
        
        Format the output as a clean, raw JSON array of objects without any markdown formatting, backticks, or "json" tags. Each object must have the following keys:
        - "question": The question text.
        - "options": An array of 4 string options.
        - "answer": The exact string of the correct option.
        - "explanation": A brief explanation of the correct answer.
        
        Ensure the JSON is perfectly valid and can be parsed by JSON.parse().`;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Clean up markdown if model still included it
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const questions = JSON.parse(text);
        res.json(questions);
    } catch (err) {
        console.error("Gemini API Error:", err);
        res.status(500).json({ error: "Failed to generate mock test questions. " + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`EDU YODHA server running on http://localhost:${PORT}`);
});
