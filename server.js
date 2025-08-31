import express from 'express';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import startTcpServer from './tcp/tcpServer.js';
import { startWebSocketServer } from './ws/wsServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT_HTTP = 8080;

app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT_HTTP, () => {
  console.log(`HTTP server listening on http://localhost:${PORT_HTTP}`);
});

// Start WebSocket and TCP servers
startWebSocketServer(server);
startTcpServer();