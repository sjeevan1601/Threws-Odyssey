// Call registerChat(app) after app.use(express.json(...)) in server.js.
export function registerChat(app) {
  app.post('/api/chat', async (req, res) => {
    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 12 ||
        messages.some((message, index) => !message ||
          message.role !== (index % 2 === 0 ? 'user' : 'assistant') ||
          typeof message.text !== 'string' || !message.text.trim() || message.text.length > 2500) ||
        messages.at(-1).role !== 'user') {
      return res.status(400).json({ error: 'Send a question up to 2,500 characters.' });
    }
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) return res.status(503).json({ error: 'Add GEMINI_API_KEY to the server’s .env file and restart.' });
    const model = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        signal: AbortSignal.timeout(60000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are WanderWays, a friendly travel planning assistant. Help with routes, destinations, itineraries and budgeting in INR. Ask for missing destination, duration, budget and traveller count when needed. Keep answers concise and readable as plain text. Clearly label price estimates. You have no live prices, booking availability or booking tools. Do not claim to have booked or verified anything.' }] },
          contents: messages.map(message => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.text }] })),
          generationConfig: { maxOutputTokens: 2048 }
        })
      });
      const data = await response.json();
      if (!response.ok) {
        const errors = {
          400: 'Gemini rejected the request. Check the configured key and model.',
          401: 'Google rejected the API credentials. Chat requires a working Gemini key.',
          403: 'Google denied access. Check your Gemini project permissions.',
          404: 'The configured Gemini model is unavailable. Update GEMINI_MODEL and restart.',
          429: 'Gemini quota or rate limit reached. Check your AI Studio usage.'
        };
        console.error('Chat provider status:', response.status, data.error?.status || 'unknown');
        return res.status(502).json({ error: errors[response.status] || 'Gemini is temporarily unavailable. Try again shortly.' });
      }
      const candidate = data.candidates?.[0];
      const reply = candidate?.content?.parts?.filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('\n').trim();
      if (!reply) return res.status(502).json({ error: 'Gemini returned no text. Try a shorter question.' });
      return res.json({ reply, truncated: candidate.finishReason === 'MAX_TOKENS' });
    } catch (error) {
      const timeout = error.name === 'TimeoutError' || error.name === 'AbortError';
      return res.status(timeout ? 504 : 502).json({ error: timeout ? 'Gemini took longer than a minute. Your question is kept below so you can retry.' : 'Could not reach Gemini. Check the server connection and retry.' });
    }
  });
}
