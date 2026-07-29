// src/lib/cache/portfolio-db.ts
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface CachedSnapshot<T> {
    key: string; // e.g. `${address}-${chainId}`
    data: T;
    cachedAt: number; // epoch ms
}

interface PortfolioDBSchema extends DBSchema {
    tokenSnapshots: {
        key: string;
        value: CachedSnapshot<unknown>;
    };
}

let dbPromise: Promise<IDBPDatabase<PortfolioDBSchema>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<PortfolioDBSchema>('defi-lens-cache', 1, {
            upgrade(db) {
                db.createObjectStore('tokenSnapshots', { keyPath: 'key' });
            },
        });
    }
    return dbPromise;
}

export async function getCachedSnapshot<T>(key: string, maxAgeMs: number): Promise<T | null> {
    const db = await getDB();
    const entry = await db.get('tokenSnapshots', key);

    if (!entry) return null;
    if (Date.now() - entry.cachedAt > maxAgeMs) return null; // stale — treat as a miss

    return entry.data as T;
}

export async function setCachedSnapshot<T>(key: string, data: T): Promise<void> {
    const db = await getDB();
    await db.put('tokenSnapshots', { key, data, cachedAt: Date.now() });
}

export async function invalidateSnapshot(key: string): Promise<void> {
    const db = await getDB();
    await db.delete('tokenSnapshots', key);
}

