// src/lib/cache/swap-history-db.ts
import type { Swap } from '@/hooks/useSwapHistory';
import { openDB, type DBSchema } from 'idb';

interface CachedSwap extends Swap {
    wallet: string;
    key: string;
}

interface SwapHistoryDBSchema extends DBSchema {
    swaps: {
        key: string;
        value: CachedSwap;
        indexes: { 'by-wallet': string };
    };
}

let dbPromise: ReturnType<typeof openDB<SwapHistoryDBSchema>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<SwapHistoryDBSchema>('defi-lens-swap-history', 1, {
            upgrade(db) {
                const store = db.createObjectStore('swaps', { keyPath: 'key' });
                store.createIndex('by-wallet', 'wallet');
            },
        });
    }
    return dbPromise;
}

// Saves swaps to the database. If a swap with the same ID already exists,
// it gets overwritten
export async function saveSwaps(wallet: string, swaps: Swap[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('swaps', 'readwrite');

    for (const swap of swaps) {
        await tx.store.put({
            ...swap,
            wallet,
            key: `${wallet}_${swap.id}`, // unique per wallet + swap
        });
    }

    await tx.done;
}

// Loads every swap we've saved for this wallet, newest first.
export async function getCachedSwaps(wallet: string): Promise<Swap[]> {
    const db = await getDB();
    const results = await db.getAllFromIndex('swaps', 'by-wallet', wallet);
    return results.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
}
