// Standalone widget: styling is isolated from the existing website.
(() => {
  if (document.getElementById('wanderways-chat-widget')) return;
  const host = document.createElement('div');
  host.id = 'wanderways-chat-widget';
  document.body.append(host);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      :host{position:fixed;right:22px;bottom:22px;z-index:2147483640;font:15px/1.5 Arial,sans-serif;color:#eaf0ff}
      *{box-sizing:border-box}button,textarea{font:inherit}button{cursor:pointer;border:0;color:inherit}
      #open{background:#1255ed;border-radius:30px;padding:14px 22px;box-shadow:0 8px 30px #0005;font-weight:700}
      #panel{width:370px;height:520px;max-height:calc(100dvh - 110px);display:flex;flex-direction:column;background:#14213a;border:1px solid #40516f;border-radius:20px;overflow:hidden;box-shadow:0 16px 60px #0007;margin-bottom:12px}
      [hidden]{display:none!important}header{padding:16px;background:#1c2e50;display:flex;align-items:center;justify-content:space-between;gap:10px}header strong{display:block}header small{color:#b8c6df;font-size:12px}header button{background:transparent;padding:8px;font-size:20px}
      #log{flex:1;overflow-y:auto;padding:16px;min-height:0}.message{padding:11px 14px;border-radius:14px;background:#263855;margin-bottom:12px;white-space:pre-wrap;overflow-wrap:anywhere}.user{background:#1555cb;margin-left:28px}.assistant{margin-right:16px}
      #status{padding:0 16px;font-size:12px;color:#ffd393}form{padding:12px;border-top:1px solid #40516f;display:flex;gap:8px;align-items:end}textarea{width:100%;min-height:46px;max-height:110px;resize:vertical;background:#0e192c;color:white;border:1px solid #40516f;border-radius:10px;padding:11px}form button{background:#1255ed;border-radius:10px;padding:12px}button:disabled{opacity:.5;cursor:wait}:focus-visible{outline:3px solid #8fbaff;outline-offset:2px}
      @media(max-width:440px){:host{right:12px;bottom:12px}#panel{width:calc(100vw - 24px)}}
    </style>
    <section id="panel" role="dialog" aria-label="WanderWays travel chat" hidden>
      <header><div><strong>WanderWays assistant</strong><small>Ask about your next trip</small></div><button id="close" aria-label="Close chat">×</button></header>
      <div id="log" role="log" aria-live="polite" aria-label="Conversation"></div>
      <p id="status" role="status"></p>
      <form><textarea aria-label="Your travel question" placeholder="Plan 2 days in Goa under ₹8,000…" maxlength="2500" rows="2" required></textarea><button type="submit">Send</button></form>
    </section>
    <button id="open" aria-expanded="false">Chat about your trip</button>`;
  const panel = root.querySelector('#panel');
  const input = root.querySelector('textarea');
  const log = root.querySelector('#log');
  const status = root.querySelector('#status');
  const send = root.querySelector('button[type=submit]');
  const open = root.querySelector('#open');
  let history = [];
  let busy = false;
  function toggle(show) {
    panel.hidden = !show;
    open.setAttribute('aria-expanded', String(show));
    (show ? input : open).focus();
  }
  function addMessage(text, role) {
    const element = document.createElement('div');
    element.className = 'message ' + role;
    element.textContent = text;
    log.append(element);
    log.scrollTop = log.scrollHeight;
    return element;
  }
  addMessage('Hi! Where would you like to go? Tell me your budget, number of travellers and trip duration.', 'assistant');
  open.addEventListener('click', () => toggle(panel.hidden));
  root.querySelector('#close').addEventListener('click', () => toggle(false));
  root.addEventListener('keydown', event => { if (event.key === 'Escape') toggle(false); });
  root.querySelector('form').addEventListener('submit', async event => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    busy = true;
    send.disabled = true;
    input.disabled = true;
    status.textContent = 'Thinking…';
    const bubble = addMessage(text, 'user');
    const messages = [...history.slice(-10), { role: 'user', text }];
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }), signal: AbortSignal.timeout(65000)
      });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Chat API is missing. Add registerChat(app) to server.js and restart the server.');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chat request failed.');
      if (typeof data.reply !== 'string') throw new Error('The server returned an invalid response.');
      addMessage(data.reply, 'assistant');
      history = [...messages, { role: 'assistant', text: data.reply.slice(0, 2500) }];
      input.value = '';
      status.textContent = data.truncated ? 'Reply shortened. Ask a follow-up for more detail.' : 'AI suggestions • Check prices and opening hours before travelling.';
    } catch (error) {
      bubble.remove();
      status.textContent = error.name === 'TimeoutError' ? 'The request timed out. You can retry your question.' : error.message;
    } finally {
      busy = false;
      send.disabled = false;
      input.disabled = false;
      if (!panel.hidden) input.focus();
    }
  });
})();
