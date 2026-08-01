// src/lib/cache/transactions-db.ts
import type { TrackedTransaction } from '@/lib/stores/transaction-store';
import { openDB, type DBSchema } from 'idb';

interface TransactionsDBSchema extends DBSchema {
  transactions: {
    key: string;
    value: TrackedTransaction;
    indexes: { 'by-createdAt': number };
  };
}

let dbPromise: ReturnType<typeof openDB<TransactionsDBSchema>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TransactionsDBSchema>('defi-lens-transactions', 1, {
      upgrade(db) {
        const store = db.createObjectStore('transactions', { keyPath: 'id' });
        store.createIndex('by-createdAt', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export async function putTransaction(tx: TrackedTransaction): Promise<void> {
  const db = await getDB();
  await db.put('transactions', tx);
}

export async function getAllTransactions(): Promise<TrackedTransaction[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('transactions', 'by-createdAt');
  return all.reverse(); // newest first
}
