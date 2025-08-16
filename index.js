import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are "Virtual Mum", a warm, encouraging study companion for ages 9–18.
Keep answers short and clear. Avoid collecting personal data (addresses, phone numbers, school names).
If a student asks for medical, legal, or emergency help, advise consulting a trusted adult or local services.
Encourage kindness, growth mindset, and safe internet behavior.`;

// ----- ENV + client -----
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY in environment");
  // don't exit so /health can still report hasKey:false
}
const client = new OpenAI({ apiKey });

// ----- simple home -----
app.get("/", (req, res) => {
  res.send("Virtual Mum backend is running. Try GET /health or POST /chat");
});

// ----- health check -----
app.get("/health", (req, res) => {
  res.json({ ok: true, hasKey: !!process.env.OPENAI_API_KEY });
});

// ----- chat endpoint -----
app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "The 'message' field is required." });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
    }

    const inputs = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    // Use a broadly available model for prototypes:
    const result = await client.responses.create({
      model: "gpt-4o-mini",
      input: inputs
    });

    const reply = result.output_text?.trim();
    if (!reply) {
      return res.status(502).json({ error: "No reply from model" });
    }
    return res.json({ reply });
  } catch (err) {
    const details = {
      status: err.status || err.code || null,
      message: err.message || null,
      data: err.response?.data || err.error || null
    };
    console.error("OpenAI error:", details);
    return res.status(500).json({ error: "OpenAI request failed", details });
  }
});

// ----- start -----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Virtual Mum backend listening on ${PORT}`));
