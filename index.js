// --- simple in-app chat page (no Thunkable blocks needed) ---
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
