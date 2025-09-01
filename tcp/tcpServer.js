import net from 'net';
import { decodePacket} from '../utils/decoder.js';
import logtoCsv from '../logger/csvLogger.js';
import {broadcast} from '../ws/wsServer.js';

const PORT_TCP = 30000;
const STRUCT_SIZE = 20; // Size of the expected data structure in bytes

function startTcpServer() {
    const server = net.createServer((socket) => {
        console.log('New TCP connection established.');

        socket.on('data', (data) => {
            for (let offset = 0; offset + STRUCT_SIZE <= data.length; offset += STRUCT_SIZE) {
                const slice = data.slice(offset, offset + STRUCT_SIZE);
                const values = decodePacket(slice);
                const timestamp = new Date().toISOString();
                logtoCsv(timestamp, values);
                broadcast({ timestamp, values });
            }
        });

        socket.on('end', () => {console.log('TCP connection closed.' )});
    }).listen(PORT_TCP, () => {
        console.log(`TCP server listening on port ${PORT_TCP}`);
    });

    return server;
}

export default startTcpServer;
