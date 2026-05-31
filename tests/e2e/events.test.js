import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { recoverMap } from '../../src/services/eventStore.services.js';
import eventsRoute from '../../src/routes/eventStore.routes.js';

const testLogPath = path.join(process.cwd(), 'events.log');

let app;
let request;

beforeAll(() => {
    if (fs.existsSync(testLogPath)) {
        fs.unlinkSync(testLogPath);
    }

    app = express();
    app.use(express.json());
    recoverMap();
    app.use('/events', eventsRoute);

    request = supertest(app);
});

afterAll(() => {
    if (fs.existsSync(testLogPath)) {
        fs.unlinkSync(testLogPath);
    }
});

describe('POST /events', () => {
    it('should create an event and return 201', async () => {
        const res = await request
            .post('/events')
            .send({ name: 'Alice', action: 'purchase', amount: 5000 });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.createdAt).toBeDefined();
        expect(res.body.name).toBe('Alice');
    });

    it('should return 400 for empty body', async () => {
        const res = await request
            .post('/events')
            .send({});

        expect(res.status).toBe(400);
    });

    it('should append to log without overwriting', async () => {
        await request.post('/events').send({ name: 'Bob' });
        await request.post('/events').send({ name: 'Charlie' });

        const content = fs.readFileSync(testLogPath, 'utf-8');
        const lines = content.trim().split('\n');
        expect(lines.length).toBeGreaterThanOrEqual(2);
    });
});

describe('GET /events/:id', () => {
    it('should retrieve an event by id', async () => {
        const post = await request
            .post('/events')
            .send({ name: 'Alice', action: 'transfer' });

        const res = await request.get(`/events/${post.body.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(post.body.id);
        expect(res.body.name).toBe('Alice');
    });

    it('should return 404 for non-existent id', async () => {
        const res = await request.get('/events/fake-id-that-does-not-exist');
        expect(res.status).toBe(404);
    });
});

describe('GET /events/stats', () => {
    it('should return total and bytes', async () => {
        const res = await request.get('/events/stats');

        expect(res.status).toBe(200);
        expect(res.body.total).toBeDefined();
        expect(res.body.bytes).toBeDefined();
        expect(typeof res.body.total).toBe('number');
        expect(typeof res.body.bytes).toBe('number');
    });
});