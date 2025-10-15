
TBF — Traders Battle Field
==========================

Files in this package:
- manifest.json    - Chrome extension manifest (new tab override)
- index.html       - Main UI (centered hub with clock and panels)
- style.css        - Custom styles for panels, rings, and glow
- script.js        - Starfield (Three.js), clock updates, button handlers
- assets/bg.png    - Optional background image (from generated art)

Installation (Load Unpacked):

1. Open Chrome and go to chrome://extensions
2. Enable Developer Mode (top-right)
3. Click Load unpacked and choose the 'tbf_project' folder
4. Open a new tab to see the dashboard

Notes:
- This is a prototype. For production, consider bundling Tailwind locally and optimizing assets.
- Some features (e.g., chrome.tabs.create) require the extension environment.
