// src/lib/cache/portfolio-history-db.ts
import { openDB, type DBSchema } from 'idb';

interface PortfolioHistoryPoint {
    key: string; // wallet + date, so one entry per wallet per day
    date: string; // e.g. "2026-07-29"
    wallet: string;
    totalUsd: number;
}

interface PortfolioHistoryDBSchema extends DBSchema {
    history: {
        key: string; // wallet + date, so one entry per wallet per day
        value: PortfolioHistoryPoint;
        indexes: { 'by-wallet': string };
    };
}

let dbPromise: ReturnType<typeof openDB<PortfolioHistoryDBSchema>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<PortfolioHistoryDBSchema>('defi-lens-portfolio-history', 1, {
            upgrade(db) {
                const store = db.createObjectStore('history', { keyPath: 'key' });
                store.createIndex('by-wallet', 'wallet');
            },
        });
    }
    return dbPromise;
}

// Saves today's total value. If we already saved a value for today,
// this simply overwrites it — so refreshing the page 5 times today
// won't create 5 separate entries, just the one for today.
export async function saveTodaysPortfolioValue(wallet: string, totalUsd: number): Promise<void> {
    const db = await getDB();
    const today = new Date().toISOString().split('T')[0]; // "2026-07-29"

    await db.put('history', {
        key: `${wallet}_${today}`,
        date: today,
        wallet,
        totalUsd,
    });
}

export async function getPortfolioHistory(wallet: string): Promise<PortfolioHistoryPoint[]> {
    const db = await getDB();
    const results = await db.getAllFromIndex('history', 'by-wallet', wallet);
    return results.sort((a, b) => a.date.localeCompare(b.date)); // oldest first, for a left-to-right chart
}
