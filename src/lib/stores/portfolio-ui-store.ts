// src/lib/stores/portfolio-ui-store.ts
import { create } from 'zustand';
import { devtools as zustandDevtools } from 'zustand/middleware';

const maybeDevtools: typeof zustandDevtools =
    typeof zustandDevtools === 'function'
        ? zustandDevtools
        : ((initializer: any) => initializer) as typeof zustandDevtools;

export type ViewMode = 'list' | 'grid';
export type SelectedChainFilter = 8453 | 1;

interface PendingTransaction {
    hash: `0x${string}`;
    description: string;
    status: 'pending' | 'confirmed' | 'failed';
}

interface PortfolioUIState {
    selectedChain: SelectedChainFilter;
    selectedCurrency: 'usd'; // room to extend later (eur, etc.)
    viewMode: ViewMode;
    hideZeroBalances: boolean;
    pendingTransactions: PendingTransaction[];

    setSelectedChain: (chain: SelectedChainFilter) => void;
    setViewMode: (mode: ViewMode) => void;
    toggleHideZeroBalances: () => void;
    addPendingTransaction: (tx: PendingTransaction) => void;
    updateTransactionStatus: (hash: string, status: PendingTransaction['status']) => void;
}
export const usePortfolioUIStore = create<PortfolioUIState>()(
    maybeDevtools(
        (set) => ({
            selectedChain: 8453, // was 'all' — Base is now the real default
            selectedCurrency: 'usd',
            viewMode: 'list',
            hideZeroBalances: true,
            pendingTransactions: [],

            setSelectedChain: (chain) => set({ selectedChain: chain }, false, 'setSelectedChain'),
            setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),
            toggleHideZeroBalances: () =>
                set((state) => ({ hideZeroBalances: !state.hideZeroBalances }), false, 'toggleHideZeroBalances'),
            addPendingTransaction: (tx) =>
                set(
                (state) => ({ pendingTransactions: [...state.pendingTransactions, tx] }),
                false,
                'addPendingTransaction'
                ),
            updateTransactionStatus: (hash, status) =>
                set(
                    (state) => ({
                        pendingTransactions: state.pendingTransactions.map((t) =>
                        t.hash === hash ? { ...t, status } : t
                        ),
                    }),
                    false,
                    'updateTransactionStatus'
                ),
        }),
            { name: 'PortfolioUIStore', enabled: process.env.NODE_ENV === 'development' } // label shown in the DevTools panel
    )
);
