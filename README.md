# TCP Dashboard

_Rev. 0.1 - september 1st, 2025_

## Summary
- Real-time browser dashboard that draws time-series data (Plotly WebGL - scattergl) delivered over WebSockets.
- The TCP server listens on port 30000. Each packet is a fixed-length 20-byte struct containing 5 float32 little-endian values (5 × 4 bytes). The server decodes those 5 floats into an array and broadcasts JSON { timestamp, values } to WebSocket clients.
- Client: `public/index.html`. The client script batches incoming packets over an update interval and uses Plotly.extendTraces for efficient updates.
  - Tune UPDATE_INTERVAL_MS (16ms ≈ 60fps, 33ms ≈ 30fps) and MAX_POINTS for your UI.
- WebSocket helper: `ws/wsServer.js`. 
- Expected shape of messages sent to clients:
  `{ "timestamp": "ISO-8601-string", "values": [v1, v2, v3, ...] }`

## Prerequisites
- Node.js (v18+ recommended)
- npm

## Quick start
1. Start server:
   - node server.js
2. Open http://localhost:8080 in your browser. The client will connect to `ws://<host>:8080/` by default.
3. On your data-producer device, open a TCP connection to the server on TCP port 30000 and send your data packets.

## Files in this repository
- public/index.html
  - Browser client UI.
  - Constants and tuning
    - CHANNELS — number of traces (5).
    - MAX_POINTS — maximum points kept per trace (e.g. 100 or 1000).
    - UPDATE_INTERVAL_MS — how often the client batches pending messages and updates the Plotly plot (e.g. 33 ms ≈ 30 Hz).
    - Y_MIN / Y_MAX — fixed vertical axis calibration (Plotly `yaxis.range` with `autorange: false`).

  - Plot setup
    - Uses Plotly scattergl traces (WebGL) for each channel to render high-rate time-series efficiently.
    - Traces are created empty and named `Channel 1..5`.
    - Layout sets a date X axis and a fixed Y axis range to keep calibration stable.

  - WebSocket connection
    - Builds URL from page origin (chooses `wss:` when page is HTTPS, otherwise `ws:`) and connects to the server on port 8080.
    - On open it logs the connection; on close/error it clears the pending buffer.

  - Message formats accepted
    - Single message: `{ "timestamp": "ISO-8601-string", "values": [v1, v2, ...] }`
    - Batched message (server-side batching): `{ "batch": [ { "timestamp": "...", "values": [...] }, ... ] }`
    - The script validates incoming objects and only queues items that have a string timestamp and an array of values.

  - Batching and updates (performance)
    - Incoming messages are pushed into an in-memory `pending` buffer by the WebSocket `onmessage` handler.
    - A single periodic consumer (`setInterval`) drains the pending buffer, converts each item to numeric x/y arrays (x = epoch ms from timestamp, y = channel values), and calls `Plotly.extendTraces()` once per update to append data for all traces.
    - This batching reduces UI work and DOM/GL updates when packet rate is high (>100 packets/s).
    - Use `MAX_POINTS` with `Plotly.extendTraces(..., maxPoints)` to cap series length and avoid unbounded memory growth.

  - Timestamp handling
    - The script parses timestamps with `Date.parse()` (ISO-8601 expected) and supplies epoch milliseconds to Plotly's date axis.

  - Practical notes
    - Ensure `values.length === CHANNELS` for each message; otherwise some channels will get undefined or misaligned data.
    - Tune `UPDATE_INTERVAL_MS` and `MAX_POINTS` to balance latency vs CPU/GPU load.
    - For very high rates consider increasing the batch interval, reducing max points, or aggregating at server side.
    - Keep the Y axis fixed via `yaxis.range` to maintain calibration; call `Plotly.relayout()` only when you intentionally change scale.

- ws/wsServer.js
  - Exports `startWebSocketServer(server)` — creates a `WebSocketServer` (ws) attached to an existing HTTP server.
  - Exports `broadcast(data)` — sends JSON to all connected clients; checks `client.readyState === 1` (OPEN).
  - Logs when module is loaded and when clients connect. Reconstructs client URL from the upgrade request for logging.

- server.js
  - Typical entrypoint: serves `public/` and calls `startWebSocketServer(server)`.

## Troubleshooting
- startWebSocketServer not executed:
  - Ensure your entrypoint imports `startWebSocketServer` and calls it after creating/listening the HTTP server.
- Client fails to connect:
  - Verify WebSocket URL in `public/index.html`. For port 8080 the client uses `location.hostname:8080`.
  - If the page is served over HTTPS use `wss:`; the client code already switches protocol based on `location.protocol`.
- Chart not drawing:
  - The client must create the Chart using the existing `<canvas id="charts">` context and call `chart.update()` after pushing data.
- broadcast uses numeric readyState:
  - `ws/wsServer.js` checks `client.readyState === 1` (OPEN) to avoid referencing `WebSocket.OPEN` in this module.
