const mongoose = require('mongoose');
const { Job } = require('./database');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/eduyodha_local";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB database.");
    
    // Clear existing jobs
    await Job.deleteMany({});
    
    const initialJobs = [
        {
            title: "Software Engineering Intern",
            company: "TechCorp Solutions",
            location: "Bengaluru, Karnataka",
            stipend: "₹15,000/mo",
            apply_link: "https://example.com/apply"
        },
        {
            title: "Data Science Trainee",
            company: "InnovateAI Labs",
            location: "Remote",
            stipend: "₹20,000/mo",
            apply_link: "https://example.com/apply"
        },
        {
            title: "Frontend Developer (React)",
            company: "StartUp Inc.",
            location: "Mysore, Karnataka",
            stipend: "₹12,000/mo",
            apply_link: "https://example.com/apply"
        }
    ];

    await Job.insertMany(initialJobs);
    console.log("Successfully seeded 3 dynamic jobs into the database!");
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Error connecting to MongoDB: ", err.message);
  });
