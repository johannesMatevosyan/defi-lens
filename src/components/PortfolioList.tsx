// src/components/PortfolioList.tsx
'use client';

import { useMultiChainPortfolio } from '@/hooks/useMultiChainPortfolio';
import { saveTodaysPortfolioValue } from '@/lib/cache/portfolio-history-db';
import { usePortfolioUIStore } from '@/lib/stores/portfolio-ui-store';
import { useEffect } from 'react';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';

const CHAIN_LABELS: Record<number, string> = { 8453: 'Base', 1: 'Ethereum' };

export function PortfolioList() {
    const { address } = useAccount();
    const selectedChain = usePortfolioUIStore((state) => state.selectedChain);
    const hideZeroBalances = usePortfolioUIStore((state) => state.hideZeroBalances);

    const { allTokens, chainTotals, grandTotal, isLoading } = useMultiChainPortfolio();

    // If a specific chain is selected, only show that chain's tokens.
    // If "all" is selected, show everything.
    const filteredByChain = allTokens.filter((token) =>
        selectedChain === 'all' ? true : token.chainId === selectedChain
    );

    const visibleTokens = filteredByChain.filter((token) =>
        hideZeroBalances ? token.balance > BigInt(0) : true
    );

    const displayTotal =
        selectedChain === 'all' ? grandTotal : chainTotals[selectedChain as 8453 | 1];

    useEffect(() => {
        if (address && grandTotal > 0) {
            saveTodaysPortfolioValue(address, grandTotal);
        }
    }, [address, grandTotal]);

    if (isLoading) {
        return (
        <div className="space-y-2 py-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ))}
        </div>
        );
    }

    if (visibleTokens.length === 0) {
        return <p className="py-4 text-sm text-zinc-500">No tokens found for this wallet.</p>;
    }

    return (
        <div className="py-4">
            <div className="mb-4 text-2xl font-semibold">
                ${displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div className="space-y-1">
                {visibleTokens.map((token) => {
                const formattedBalance = formatUnits(token.balance, token.decimals);

                return (
                    <div
                        key={`${token.chainId}-${token.contractAddress}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                        <div>
                            <div className="font-medium">
                                {token.symbol}
                                {selectedChain === 'all' && (
                                    <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                                        {CHAIN_LABELS[token.chainId]}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-zinc-500">{token.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-medium">
                                {Number(formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                            </div>
                            <div className="text-sm text-zinc-500">
                                {token.usdValue !== null ? `$${token.usdValue.toFixed(2)}` : 'Price unavailable'}
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>
        </div>
    );
}
