import fs from 'fs';
const CSV_PATH = 'dati.csv';

const csvStream = fs.createWriteStream(CSV_PATH, { flags: 'a' });
csvStream.write('Timestamp\tVal1\tVal2\tVal3\tVal4\tVal5\n');

function logToCsv(timestamp, values) {
    csvStream.write(`${timestamp}\t${values.join('\t')}\n`);
}

export default logToCsv;
