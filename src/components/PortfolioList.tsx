// src/components/PortfolioList.tsx
'use client';

import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { usePortfolioUIStore } from '@/lib/stores/portfolio-ui-store';
import { formatUnits } from 'viem';

export function PortfolioList() {
    const selectedChain = usePortfolioUIStore((state) => state.selectedChain);
    const hideZeroBalances = usePortfolioUIStore((state) => state.hideZeroBalances);

    const { data: tokens, isLoading: tokensLoading, error: tokensError } = useTokenBalances(selectedChain);
    const contractAddresses = tokens?.map((t) => t.contractAddress) ?? [];
    const { data: prices, isLoading: pricesLoading } = useTokenPrices(contractAddresses, selectedChain);

    if (tokensLoading) {
        return (
            <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                ))}
            </div>
        );
    }

    if (tokensError) {
        return (
            <p className="py-4 text-sm text-red-600">
                Couldn't load token balances. Try refreshing.
            </p>
        );
    }

    const visibleTokens = (tokens ?? []).filter((token) => {
        if (!hideZeroBalances) return true;
        return token.balance > BigInt(0);
    });

    if (visibleTokens.length === 0) {
        return <p className="py-4 text-sm text-zinc-500">No tokens found for this wallet.</p>;
    }

    const totalUsd = visibleTokens.reduce((sum, token) => {
        const price = prices?.[token.contractAddress] ?? null;
        if (price === null) return sum;
        const formatted = Number(formatUnits(token.balance, token.decimals));
        return sum + formatted * price;
    }, 0);

    return (
        <div className="py-4">
            <div className="mb-4 text-2xl font-semibold">
                ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div className="space-y-1">
                {visibleTokens.map((token) => {

                    const price = prices?.[token.contractAddress] ?? null;
                    const formattedBalance = formatUnits(token.balance, token.decimals);
                    const usdValue = price !== null ? Number(formattedBalance) * price : null;

                    return (
                        <div
                            key={token.contractAddress}
                            className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        >
                            <div>
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-sm text-zinc-500">{token.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">
                                    {Number(formattedBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                </div>
                                <div className="text-sm text-zinc-500">
                                    {pricesLoading ? '...' : usdValue !== null ? `$${usdValue.toFixed(2)}` : 'Price unavailable'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
