const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { Video, Comment, User, Note, TestScore, Job } = require('./database');
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

// Middleware to verify token for protected routes
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// --- CLOUD NOTES API ---
app.get('/api/notes/:video_id', verifyToken, async (req, res) => {
    try {
        const note = await Note.findOne({ user_id: req.user.id, video_id: req.params.video_id });
        res.json({ note_text: note ? note.note_text : "" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/notes', verifyToken, async (req, res) => {
    try {
        const { video_id, note_text } = req.body;
        let note = await Note.findOne({ user_id: req.user.id, video_id });
        if (note) {
            note.note_text = note_text;
            note.updated_at = Date.now();
            await note.save();
        } else {
            note = await Note.create({ user_id: req.user.id, video_id, note_text });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- LEADERBOARD & MOCK TEST SCORES ---
app.post('/api/mocktest/score', verifyToken, async (req, res) => {
    try {
        const { student_name, subject, score, total } = req.body;
        const testScore = await TestScore.create({ user_id: req.user.id, student_name, subject, score, total });
        res.json({ success: true, testScore });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const scores = await TestScore.find().sort({ score: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DYNAMIC JOB PORTAL ---
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ created_at: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/jobs', async (req, res) => {
    // Simple unprotected route for adding jobs easily via script
    try {
        const newJob = await Job.create(req.body);
        res.json({ success: true, newJob });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PAYMENT API (MOCK) ---
app.post('/api/payment/order', verifyToken, async (req, res) => {
    // Return mock order ID
    res.json({ orderId: "order_MOCK" + Math.floor(Math.random()*100000) });
});

app.post('/api/payment/verify', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.is_pro = true;
            await user.save();
        }
        // Issue new token with pro privileges
        const token = jwt.sign({ id: user._id, is_pro: true }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fixed Questions Data
const fixedQuestions = {
    Physics: [
        { question: "What is the SI unit of force?", options: ["Newton", "Joule", "Watt", "Pascal"], answer: "Newton", explanation: "Force is measured in Newtons (N) in the International System of Units." },
        { question: "What is the approximate speed of light in a vacuum?", options: ["3 × 10^8 m/s", "3 × 10^5 m/s", "3 × 10^6 m/s", "3 × 10^10 m/s"], answer: "3 × 10^8 m/s", explanation: "The speed of light in a vacuum is exactly 299,792,458 m/s, usually approximated as 3 × 10^8 m/s." },
        { question: "What is the formula for kinetic energy?", options: ["1/2 mv^2", "mgh", "ma", "1/2 kx^2"], answer: "1/2 mv^2", explanation: "Kinetic energy depends on mass (m) and velocity (v) squared." },
        { question: "What is the SI unit of electric charge?", options: ["Coulomb", "Ampere", "Volt", "Ohm"], answer: "Coulomb", explanation: "Electric charge is measured in Coulombs (C)." },
        { question: "What is the standard acceleration due to gravity on Earth?", options: ["9.8 m/s^2", "9.8 cm/s^2", "10 m/s^2", "9.8 km/s^2"], answer: "9.8 m/s^2", explanation: "Standard gravity on Earth is approximately 9.8 m/s^2." }
    ],
    Chemistry: [
        { question: "What is the atomic number of Carbon?", options: ["6", "12", "14", "8"], answer: "6", explanation: "Carbon has 6 protons, so its atomic number is 6." },
        { question: "What is the chemical formula for water?", options: ["H2O", "CO2", "O2", "H2O2"], answer: "H2O", explanation: "Water consists of two hydrogen atoms and one oxygen atom." },
        { question: "What is the pH of pure water at 25°C?", options: ["7", "0", "14", "1"], answer: "7", explanation: "Pure water is neutral with a pH of exactly 7." },
        { question: "What is the most abundant gas in Earth's atmosphere?", options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Argon"], answer: "Nitrogen", explanation: "Nitrogen makes up about 78% of the Earth's atmosphere." },
        { question: "Which noble gas is commonly used in balloons?", options: ["Helium", "Neon", "Argon", "Krypton"], answer: "Helium", explanation: "Helium is lighter than air and non-flammable, making it ideal for balloons." }
    ],
    Mathematics: [
        { question: "What is the derivative of sin(x)?", options: ["cos(x)", "-cos(x)", "-sin(x)", "sec^2(x)"], answer: "cos(x)", explanation: "The derivative of the sine function is the cosine function." },
        { question: "What is the integral of 2x dx?", options: ["x^2 + C", "2x^2 + C", "x + C", "2 + C"], answer: "x^2 + C", explanation: "Using the power rule for integration, the integral of 2x is x^2 + C." },
        { question: "What is the formula for the area of a circle?", options: ["πr^2", "2πr", "πd", "4/3πr^3"], answer: "πr^2", explanation: "The area of a circle is pi times the radius squared." },
        { question: "What is the value of 10! / 9!?", options: ["10", "90", "1", "9"], answer: "10", explanation: "10! = 10 × 9!, so 10! / 9! = 10." },
        { question: "What is the sum of the angles in a triangle?", options: ["180 degrees", "360 degrees", "90 degrees", "270 degrees"], answer: "180 degrees", explanation: "The interior angles of any planar triangle always add up to 180 degrees." }
    ],
    Biology: [
        { question: "What is known as the powerhouse of the cell?", options: ["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"], answer: "Mitochondria", explanation: "Mitochondria generate most of the cell's supply of ATP." },
        { question: "What is the process by which plants make their own food?", options: ["Photosynthesis", "Respiration", "Transpiration", "Fermentation"], answer: "Photosynthesis", explanation: "Plants use sunlight to synthesize foods from carbon dioxide and water." },
        { question: "What is the genetic material in human cells?", options: ["DNA", "RNA", "Protein", "Lipid"], answer: "DNA", explanation: "Deoxyribonucleic acid (DNA) carries the genetic instructions." },
        { question: "What is the basic structural and functional unit of life?", options: ["Cell", "Tissue", "Organ", "Organism"], answer: "Cell", explanation: "All living organisms are composed of one or more cells." },
        { question: "How many chambers does the human heart have?", options: ["4", "3", "2", "5"], answer: "4", explanation: "The human heart has two atria and two ventricles." }
    ]
};

app.post('/api/mocktest/generate', async (req, res) => {
    const { subject, chapter } = req.body;
    if (!subject) return res.status(400).json({ error: "Missing subject" });

    try {
        const baseQuestions = fixedQuestions[subject] || fixedQuestions['Physics'];
        let full60Questions = [];
        
        // Generate exactly 60 questions by looping the base questions
        for (let i = 0; i < 60; i++) {
            const template = baseQuestions[i % baseQuestions.length];
            // Clone the object to avoid reference issues
            const q = { ...template };
            q.question = `[Q${i + 1}] ${q.question} (Topic: ${chapter || subject})`;
            full60Questions.push(q);
        }
        
        res.json(full60Questions);
    } catch (err) {
        console.error("Mock Test Generation Error:", err);
        res.status(500).json({ error: "Failed to generate mock test questions." });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, video_title } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });
        
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `You are a helpful AI tutor for engineering students on the EDU YODHA platform. 
        The student is currently watching a video titled: "${video_title || 'General Subject'}".
        Student's Question: ${message}
        
        Provide a clear, concise, and educational response.`;
        
        const result = await model.generateContent(prompt);
        res.json({ response: result.response.text() });
    } catch (err) {
        console.error("Chatbot API Error:", err);
        res.status(500).json({ error: "Failed to process chat message." });
    }
});

app.listen(PORT, () => {
    console.log(`EDU YODHA server running on http://localhost:${PORT}`);
});
