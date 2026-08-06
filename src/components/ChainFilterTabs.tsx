// src/components/ChainFilterTabs.tsx
'use client';

import { SelectedChainFilter, usePortfolioUIStore } from '@/lib/stores/portfolio-ui-store';

const CHAINS: { value: SelectedChainFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 8453, label: 'Base' },
    { value: 1, label: 'Ethereum' },
];

export function ChainFilterTabs() {
    const selectedChain = usePortfolioUIStore((state) => state.selectedChain);
    const setSelectedChain = usePortfolioUIStore((state) => state.setSelectedChain);

    return (
        <div className="flex gap-1 rounded-full border border-black/[.08] bg-zinc-50 p-1 dark:border-white/[.145] dark:bg-zinc-900">
            {CHAINS.map(({ value, label }) => {
                const isActive = selectedChain === value;
                return (
                    <button
                        key={value}
                        onClick={() => setSelectedChain(value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        isActive
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.08]'
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
