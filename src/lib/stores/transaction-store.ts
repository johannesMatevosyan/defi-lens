// src/lib/stores/transaction-store.ts
import { getAllTransactions, putTransaction } from '@/lib/cache/transactions-db';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type TransactionStatus =
  | 'simulating'
  | 'awaiting-signature'
  | 'broadcasting'
  | 'pending'
  | 'confirmed'
  | 'failed';

export interface TrackedTransaction {
    id: string; // client-generated, stable for the whole lifecycle
    hash?: `0x${string}`; // only exists once broadcasting succeeds
    chainId: number;
    description: string; // human-readable summary, e.g. "Approve 100 USDC"
    status: TransactionStatus;
    errorMessage?: string;
    createdAt: number;
    updatedAt: number;
}

interface TransactionStoreState {
    transactions: TrackedTransaction[];
    hydrated: boolean;
    hydrate: () => Promise<void>;
    startTransaction: (params: { chainId: number; description: string }) => string;
    updateStatus: (id: string, status: TransactionStatus, patch?: Partial<TrackedTransaction>) => void;
}

export const useTransactionStore = create<TransactionStoreState>()(
    devtools(
        (set) => ({
            transactions: [],
            hydrated: false,

            hydrate: async () => {
                const stored = await getAllTransactions();
                set({ transactions: stored, hydrated: true }, false, 'hydrate');
            },

            startTransaction: ({ chainId, description }) => {
                const id = crypto.randomUUID();
                const tx: TrackedTransaction = {
                    id,
                    chainId,
                    description,
                    status: 'simulating',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                set((state) => ({ transactions: [tx, ...state.transactions] }), false, 'startTransaction');
                void putTransaction(tx);
                return id;
            },

            updateStatus: (id, status, patch) => {
                set(
                (state) => ({
                        transactions: state.transactions.map((tx) => {
                        if (tx.id !== id) return tx;
                        const updated = { ...tx, ...patch, status, updatedAt: Date.now() };
                        void putTransaction(updated);
                        return updated;
                    }),
                }),
                    false,
                    'updateStatus'
                );
            },
        }),
        { name: 'TransactionStore', enabled: process.env.NODE_ENV === 'development' }
    )
);
