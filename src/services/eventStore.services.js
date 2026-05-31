import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const eventsFilePath = path.join(process.cwd(), 'events.log');
const index = new Map();

export const saveEvent = (event) => {
    if (!event || Object.keys(event).length === 0) {
        return null;
    }
    event.id = uuidv4();
    event.createdAt = new Date().toISOString();

    const eventData = JSON.stringify(event) + '\n';
    const offset = fs.existsSync(eventsFilePath) ? fs.statSync(eventsFilePath).size : 0;
    const length = Buffer.byteLength(eventData, 'utf-8');
    
    fs.appendFileSync(eventsFilePath, eventData);
    index.set(event.id, { offset, length });

    return event;
}

export const getEventsById = (id) => {
    if (!index.has(id)) {
        return null;
    }
    const { offset, length } = index.get(id);
    const fd = fs.openSync(eventsFilePath, 'r');
    const buffer = Buffer.alloc(length);

    fs.readSync(fd, buffer, 0, length, offset);
    fs.closeSync(fd);

    return JSON.parse(buffer.toString('utf-8'));   
}

export const getStats = () => {
    return {
        total: index.size,
        bytes: fs.existsSync(eventsFilePath) ? fs.statSync(eventsFilePath).size : 0
    };
}

export const recoverMap = () => {
    if (!fs.existsSync(eventsFilePath)) {
        console.log('No events.log found, starting afresh')
        return;
    }

    const fileContent = fs.readFileSync(eventsFilePath, 'utf-8')
    const lines = fileContent.split('\n').filter(line => line.trim() !== '')
    let currentOffset = 0

    lines.forEach(line => {
        const length = Buffer.byteLength(line + '\n', 'utf-8')
        const event = JSON.parse(line)

        index.set(event.id, { offset: currentOffset, length })
        currentOffset += length
    })
    console.log(`Recovered ${index.size} events from events.log`)
}
 