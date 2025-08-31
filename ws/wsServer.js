import { WebSocketServer } from 'ws';
let wss;

console.log('wsServer module loaded'); // added: confirms module is imported

export function startWebSocketServer(server) {
    wss = new WebSocketServer({ server });
    if (!wss) {
        console.error('Failed to create WebSocket server');
    } else {
        console.log('WebSocket server started on ',wss.url); // added: confirms server start
    }

    wss.on('connection', (ws, req) => {
        const path = req.url;              // "/ws-path?foo=bar"
        const host = req.headers.host;     // "example.com:3000"
        const scheme = req.socket.encrypted ? 'wss' : 'ws';
        const fullUrl = `${scheme}://${host}${path}`;
        console.log('client connected to', fullUrl);
    });

}

export function broadcast(data) {
    if (!wss) {return;}

    wss.clients.forEach((client) => {
        // use numeric readyState to avoid referencing an undefined WebSocket symbol
        if (client.readyState === 1) {  // 1 === WebSocket.OPEN
            client.send(JSON.stringify(data));
        }
    });
}
