# WanderWays with Gemini and Google Places

1. Extract this folder and open it in VS Code.
2. Copy .env.example to .env, beside server.js.
3. Paste your own Gemini key after GEMINI_API_KEY=. The uploaded website contained no API key.
4. Optionally add GOOGLE_MAPS_API_KEY for Places API (New), enabled in your billing-enabled Google project.
5. Run npm.cmd install, then npm.cmd start in a Windows terminal in this folder.
6. Open http://localhost:3000 and click Plan My Trip.

Stop the previous Roam server with Ctrl+C first, so port 3000 is available.
After changing .env, save it and restart the server.
The frontend is in public/. Server files and keys are outside the public folder.
The API uses GEMINI_MODEL from .env. Change it if Google reports the model is unavailable.
Hotel and itinerary requests display errors independently. AI activities require local verification.
Hotel details do not include live room rates or booking availability.
This ZIP contains integration code. Live generation requires your own valid key and quota.
For a published site, host this whole Node.js project on a Node-capable server.
Static file hosting alone cannot run server.js.
Existing Explore page and its filters are included.
