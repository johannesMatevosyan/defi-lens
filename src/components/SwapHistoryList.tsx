// src/components/SwapHistoryList.tsx
'use client';

import { useSwapHistoryPaginated } from '@/hooks/useSwapHistory';
import { getExplorerTxUrl } from '@/lib/explorer';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { getSwapDirection } from '@/lib/swap-direction';
import { useAccount } from 'wagmi';

export function SwapHistoryList() {
    const { address } = useAccount();
    const { swaps, loadMore, hasMore, isLoading } = useSwapHistoryPaginated(address);

    if (isLoading && swaps.length === 0) {
        return (
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
            ))}
        </div>
        );
    }

    if (swaps.length === 0) {
        return <p className="text-sm text-zinc-400">No swaps found for this wallet on Base.</p>;
    }

    return (
        <div className="space-y-2">
            {swaps.map((swap) => {
                const direction = getSwapDirection(swap);
                const explorerUrl = getExplorerTxUrl(8453, swap.transaction.id);

                return (
                    <div key={swap.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                            <div className="font-mono text-sm font-medium">
                                <span className="text-negative">-{direction.gave.amount.toFixed(4)} {direction.gave.symbol}</span>
                                {' → '}
                                <span className="text-positive">+{direction.received.amount.toFixed(4)} {direction.received.symbol}</span>
                            </div>
                            <div className="font-mono text-xs text-zinc-400">
                                {formatRelativeTime(swap.timestamp)} · ${Number(swap.amountUSD).toFixed(2)}
                            </div>
                        </div>
                        {explorerUrl && (
                            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-200">
                                View
                            </a>
                        )}
                    </div>
                );
            })}

            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="w-full rounded border border-border bg-white/5 py-2 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-50"
                >
                    {isLoading ? 'Loading…' : 'Load more'}
                </button>
            )}
        </div>
    );
}
