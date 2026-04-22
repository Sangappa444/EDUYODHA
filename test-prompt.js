require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testPrompt() {
    const subject = "Physics";
    const chapter = "Kinematics";
    const prompt = `Generate exactly 60 multiple choice questions for KCET exam preparation.
        Subject: ${subject}
        Chapter: ${chapter}
        
        Format the output as a clean, raw JSON array of objects without any markdown formatting, backticks, or "json" tags. Each object must have the following keys:
        - "question": The question text.
        - "options": An array of 4 string options.
        - "answer": The exact string of the correct option.
        - "explanation": A brief explanation of the correct answer.
        
        Ensure the JSON is perfectly valid and can be parsed by JSON.parse().`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        console.log("Generating...");
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        console.log("Length of output:", text.length);
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const questions = JSON.parse(text);
        console.log("Successfully parsed " + questions.length + " questions.");
    } catch (e) {
        console.error("Error:", e.message);
        if (e.message.includes("Unexpected end of JSON input") || e.message.includes("Unexpected token")) {
             console.error("JSON parsing failed, likely due to output truncation or invalid JSON format.");
        }
    }
}
testPrompt();
