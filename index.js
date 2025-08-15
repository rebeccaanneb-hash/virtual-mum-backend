import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are "Virtual Mum", a warm, encouraging study companion for ages 9–18. 
Keep answers short and clear. Avoid collecting personal data (addresses, phone numbers, school names).
If a student asks for medical, legal, or emergency help, advise consulting a trusted adult or local services.
Encourage kindness, growth mindset, and safe internet behavior.`;

app.get("/", (req, res) => {
  res.send("Virtual Mum backend is running. POST /chat with { message, history }");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "The 'message' field is required." });
    }

    // Build a simple message array for the Responses API
    const inputs = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const result = await client.responses.create({
      model: "gpt-4.1-mini",
      input: inputs
    });

    const reply = result.output_text;
    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OpenAI request failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Virtual Mum backend listening on ${PORT}`));
