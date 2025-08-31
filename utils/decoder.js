export function decodePacket(buffer) {
    const values = [];
    for (let i = 0; i < buffer.length; i += 4) {
        values.push(buffer.readFloatLE(i));
    }
    return values;
}
