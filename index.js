import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

// 1) create the app first
const app = express();
app.use(cors());
app.use(express.json());

// 2) constants
const SYSTEM_PROMPT = `You are "Virtual Mum", a warm, encouraging study companion for ages 9–18.
Keep answers short and clear. Avoid collecting personal data (addresses, phone numbers, school names).
If a student asks for medical, legal, or emergency help, advise consulting a trusted adult or local services.
Encourage kindness, growth mindset, and safe internet behavior.`;

// 3) openai client from env
const apiKey = process.env.OPENAI_API_KEY || "";
const client = apiKey ? new OpenAI({ apiKey }) : null;

// 4) routes
app.get("/", (req, res) => {
  res.send("Virtual Mum backend is running. Try GET /health or /app, or POST /chat");
});

app.get("/health", (req, res) => {
  res.json({ ok: true, hasKey: !!process.env.OPENAI_API_KEY });
});

app.get("/app", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Virtual Mum</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:16px;max-width:720px}
  h1{font-size:20px;margin:0 0 12px}
  textarea,input,button{font-size:16px}
  textarea{width:100%;padding:10px}
  #reply{white-space:pre-wrap;background:#f6f8fa;padding:12px;border-radius:8px;margin-top:10px}
  .row{margin:10px 0}
</style>
</head><body>
  <h1>Virtual Mum</h1>
  <div class="row">
    <label>Your message</label>
    <textarea id="msg" rows="3" placeholder="Type a question..."></textarea>
  </div>
  <div class="row">
    <button id="send">Send</button>
  </div>
  <div id="reply">(reply will appear here)</div>

<script>
let history = [];
const sendBtn = document.getElementById('send');
const msgEl = document.getElementById('msg');
const replyEl = document.getElementById('reply');

sendBtn.addEventListener('click', async () => {
  const message = msgEl.value.trim();
  if(!message){ replyEl.textContent = 'Please type a message.'; return; }
  replyEl.textContent = 'Thinking...';
  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message, history })
    });
    const data = await res.json();
    if(data.reply){
      history.push({role:'user', content: message});
      history.push({role:'assistant', content: data.reply});
      replyEl.textContent = data.reply;
      msgEl.value = '';
    } else {
      replyEl.textContent = 'Unexpected response: ' + JSON.stringify(data);
    }
  } catch(e){
    replyEl.textContent = 'Error: ' + e.message;
  }
});
</script>
</body></html>`);
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: "The 'message' field is required." });
    if (!client) return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });

    const inputs = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ];

    const result = await client.responses.create({
      model: "gpt-4o-mini",
      input: inputs
    });

    const reply = result.output_text?.trim();
    if (!reply) return res.status(502).json({ error: "No reply from model" });
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

// 5) start server (Render injects PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Virtual Mum backend listening on ${PORT}`));
