import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const testLogPath = path.join(process.cwd(), 'events.log');

let saveEvent, getEventsById, getStats, recoverMap;

beforeEach(async () => {
    vi.resetModules()

    const module = await import('../../src/services/eventStore.services.js')
    saveEvent = module.saveEvent;
    getEventsById = module.getEventsById;
    getStats = module.getStats;
    recoverMap = module.recoverMap;

    if (fs.existsSync(testLogPath)) {
        fs.unlinkSync(testLogPath);
    }
});

afterEach(() => {
    if (fs.existsSync(testLogPath)) {
        fs.unlinkSync(testLogPath);
    }
});

describe('saveEvent', () => {
    it('should save an event and return it with id and createdAt', () => {
        const event = { name: 'Alice', action: 'purchase' };
        const saved = saveEvent(event);

        expect(saved).not.toBeNull();
        expect(saved.id).toBeDefined();
        expect(saved.createdAt).toBeDefined();
        expect(saved.name).toBe('Alice');
        expect(saved.action).toBe('purchase');
    });

    it('should append event to events.log', () => {
        saveEvent({ name: 'Bob' });
        expect(fs.existsSync(testLogPath)).toBe(true);

        const content = fs.readFileSync(testLogPath, 'utf-8');
        expect(content.trim()).not.toBe('');
    });

    it('should return null for empty event body', () => {
        const result = saveEvent({});
        expect(result).toBeNull();
    });

    it('should append multiple events without overwriting', () => {
        saveEvent({ name: 'Alice' });
        saveEvent({ name: 'Bob' });
        saveEvent({ name: 'Charlie' });

        const content = fs.readFileSync(testLogPath, 'utf-8');
        const lines = content.trim().split('\n');
        expect(lines.length).toBe(3);
    });

    it('should handle unicode characters correctly', () => {
        const event = { name: '日本語', emoji: '🚀' };
        const saved = saveEvent(event);
        expect(saved).not.toBeNull();
        expect(saved.name).toBe('日本語');
    });
});

describe('getEventsById', () => {
    it('should retrieve a saved event by id', () => {
        const saved = saveEvent({ name: 'Alice', action: 'purchase' });
        const retrieved = getEventsById(saved.id);

        expect(retrieved).not.toBeNull();
        expect(retrieved.id).toBe(saved.id);
        expect(retrieved.name).toBe('Alice');
    });

    it('should return null for non-existent id', () => {
        const result = getEventsById('non-existent-id');
        expect(result).toBeNull();
    });

    it('should retrieve correct event when multiple events exist', () => {
        saveEvent({ name: 'Alice' });
        const target = saveEvent({ name: 'Bob' });
        saveEvent({ name: 'Charlie' });

        const retrieved = getEventsById(target.id);
        expect(retrieved.name).toBe('Bob');
    });
});

describe('getStats', () => {
    it('should return total 0 and bytes 0 when no events', () => {
        const stats = getStats();
        expect(stats.total).toBe(0);
        expect(stats.bytes).toBe(0);
    });

    it('should return correct total after saving events', () => {
        saveEvent({ name: 'Alice' });
        saveEvent({ name: 'Bob' });

        const stats = getStats();
        expect(stats.total).toBe(2);
        expect(stats.bytes).toBeGreaterThan(0);
    });

    it('should return correct bytes matching file size', () => {
        saveEvent({ name: 'Alice' });
        const stats = getStats();
        const fileSize = fs.statSync(testLogPath).size;
        expect(stats.bytes).toBe(fileSize);
    });
});

describe('recoverMap', () => {
    it('should recover events from existing log file', () => {
        saveEvent({ name: 'Alice' });
        saveEvent({ name: 'Bob' });

        recoverMap();

        const stats = getStats();
        expect(stats.total).toBe(2);
    });

    it('should handle missing log file gracefully', () => {
        expect(() => recoverMap()).not.toThrow();
    });

    it('should seek correctly after recovery', () => {
        const saved = saveEvent({ name: 'Alice' });

        recoverMap();

        const retrieved = getEventsById(saved.id);
        expect(retrieved).not.toBeNull();
        expect(retrieved.name).toBe('Alice');
    });
});