# Virtual Mum — Minimal Backend (Node + Express)

This tiny server hides your OpenAI API key and exposes one endpoint your mobile app can call.

## 1) Set up locally
1. Install Node.js LTS.
2. Download this folder or the ZIP.
3. Create a `.env` file by copying `.env.example` and add your real `OPENAI_API_KEY`.
4. In a terminal, run:
   ```bash
   npm install
   npm start
   ```
5. You should see: `Virtual Mum backend listening on 3000`.

## 2) Test the endpoint
With the server running:
```bash
curl -X POST http://localhost:3000/chat     -H "Content-Type: application/json"     -d '{ "message": "Say hello!", "history": [] }'
```

## 3) Deploy (one option: Replit)
1. Create a new **Node.js** Repl.
2. Upload these files (or connect to your GitHub repo).
3. In the **Secrets** / **Environment Variables**, add `OPENAI_API_KEY` with your real key.
4. Press **Run**; note the public URL (e.g., `https://your-repl-name.your-user.repl.co`).

You can deploy to other hosts too (Railway, Render, Fly.io, Cloudflare, Vercel) if you prefer.

## 4) Endpoint contract for your app
- **URL:** `POST /chat`
- **Body JSON:** `{ "message": "text", "history": [{ "role":"user|assistant", "content":"..." }] }`
- **Response JSON:** `{ "reply": "assistant text" }`

## 5) Customise the bot
Edit the `SYSTEM_PROMPT` in `index.js` to change tone, rules, and guardrails.

## 6) Voice later (optional)
For realtime voice, build a simple web page using OpenAI's Realtime API and load it in a WebView in your app.

---
**Security note:** Keep your API key on the server. Never ship it inside the mobile app.
