# TCP Dashboard

_Rev. 0.1 - august 31, 2025_

Summary
- Real-time browser dashboard that draws time-series data (Chart.js) delivered over WebSockets.
- Client: `public/index.html`. WebSocket helper: `ws/wsServer.js`.
- Expected shape of messages sent to clients:
  `{ "timestamp": "ISO-8601-string", "values": [v1, v2, v3, ...] }`

Prerequisites
- Node.js (v18+ recommended)
- npm

Quick start
1. From project root:
   - npm init -y
   - Add `"type": "module"` to package.json (ESM imports are used).
   - npm install express ws
2. Create an HTTP server entrypoint (see example below).
3. Start server:
   - node src/server.js
4. Open http://localhost:8080 in your browser. The client will connect to `ws://<host>:8080/` by default.

Files in this repository
- public/index.html
  - Browser client UI.
  - Loads Chart.js from CDN.
  - Creates a Chart on `<canvas id="charts">`.
  - Opens a WebSocket to the server (built from location + port 8080).
  - On each incoming message it parses `{ timestamp, values }`, extracts hh:mm:ss.mmm, pushes labels and dataset values, trims to last 100 points, and calls `chart.update()`.

- ws/wsServer.js
  - Exports `startWebSocketServer(server)` — creates a `WebSocketServer` (ws) attached to an existing HTTP server.
  - Exports `broadcast(data)` — sends JSON to all connected clients; checks `client.readyState === 1` (OPEN).
  - Logs when module is loaded and when clients connect. Reconstructs client URL from the upgrade request for logging.

- server.js
  - Typical entrypoint: serves `public/` and calls `startWebSocketServer(server)`.

Troubleshooting
- startWebSocketServer not executed:
  - Ensure your entrypoint imports `startWebSocketServer` and calls it after creating/listening the HTTP server.
- Client fails to connect:
  - Verify WebSocket URL in `public/index.html`. For port 8080 the client uses `location.hostname:8080`.
  - If the page is served over HTTPS use `wss:`; the client code already switches protocol based on `location.protocol`.
- Chart not drawing:
  - The client must create the Chart using the existing `<canvas id="charts">` context and call `chart.update()` after pushing data.
- broadcast uses numeric readyState:
  - `ws/wsServer.js` checks `client.readyState === 1` (OPEN) to avoid referencing `WebSocket.OPEN` in this module.
