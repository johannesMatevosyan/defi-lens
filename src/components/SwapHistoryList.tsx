// src/components/SwapHistoryList.tsx
'use client';

import { useSwapHistoryPaginated } from '@/hooks/useSwapHistory';
import { getExplorerTxUrl } from '@/lib/explorer';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { getSwapDirection } from '@/lib/swap-direction';
import { useAccount } from 'wagmi';

export function SwapHistoryList() {
    const { address } = useAccount();
    // const testAddress = '0xb01caea8c6c47bbf4f4b4c5080ca642043359c2e';
    const { swaps, loadMore, hasMore, isLoading } = useSwapHistoryPaginated(address);

    if (isLoading && swaps.length === 0) {
        return (
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ))}
        </div>
        );
    }

    if (swaps.length === 0) {
        return <p className="text-sm text-zinc-500">No swaps found for this wallet on Base.</p>;
    }

    return (
        <div className="space-y-2">
            {swaps.map((swap) => {
                const direction = getSwapDirection(swap);
                const explorerUrl = getExplorerTxUrl(8453, swap.transaction.id);

                return (
                <div key={swap.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                        <div className="text-sm font-medium">
                            <span className="text-red-600">-{direction.gave.amount.toFixed(4)} {direction.gave.symbol}</span>
                            {' → '}
                            <span className="text-green-600">+{direction.received.amount.toFixed(4)} {direction.received.symbol}</span>
                        </div>
                        <div className="text-xs text-zinc-500">
                            {formatRelativeTime(swap.timestamp)} · ${Number(swap.amountUSD).toFixed(2)}
                        </div>
                    </div>
                    {explorerUrl && (
                    <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
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
                    className="w-full rounded border py-2 text-sm text-zinc-600"
                >
                    {isLoading ? 'Loading…' : 'Load more'}
                </button>
            )}
        </div>
    );
}
