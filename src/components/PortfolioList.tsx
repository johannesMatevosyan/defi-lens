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
                <div key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />
            ))}
        </div>
        );
    }

    if (visibleTokens.length === 0) {
        return <p className="py-4 text-sm text-zinc-400">No tokens found for this wallet.</p>;
    }

    return (
        <div className="py-4">
            <div className="mb-4 font-mono text-2xl font-semibold text-zinc-100">
                ${displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div className="space-y-1">
                {visibleTokens.map((token) => {
                const formattedBalance = formatUnits(token.balance, token.decimals);

                return (
                    <div
                        key={`${token.chainId}-${token.contractAddress}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5"
                    >
                        <div>
                            <div className="font-mono font-medium">
                                {token.symbol}
                                {selectedChain === 'all' && (
                                    <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
                                        {CHAIN_LABELS[token.chainId]}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-zinc-400">{token.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-mono font-medium">
                                {Number(formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                            </div>
                            <div className="text-sm text-zinc-400">
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
