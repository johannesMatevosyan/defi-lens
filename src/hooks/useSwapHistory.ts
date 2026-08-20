// src/hooks/useSwapHistory.ts
'use client';

import { getCachedSwaps, saveSwaps } from '@/lib/cache/swap-history-db';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export interface Swap {
    id: string;
    timestamp: string;
    amount0: string;
    amount1: string;
    amountUSD: string;
    transaction: { id: string };
    token0: { symbol: string; decimals: string };
    token1: { symbol: string; decimals: string };
}

async function fetchSwapHistoryPage(
  walletAddress: string,
  olderThanTimestamp: string | null
): Promise<Swap[]> {
    const res = await fetch('/api/graph/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, first: 20, olderThanTimestamp }),
    });
    if (!res.ok) throw new Error('Failed to fetch swap history');
    const data = await res.json();
    return data.swaps;
}

// Combines two lists of swaps into one, removing duplicates by ID,
// and sorts the result newest first.
function mergeSwaps(existing: Swap[], incoming: Swap[]): Swap[] {
    const map = new Map<string, Swap>();
    for (const swap of existing) map.set(swap.id, swap);
    for (const swap of incoming) map.set(swap.id, swap);
    return Array.from(map.values()).sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
}

export function useSwapHistoryPaginated(walletAddress?: string) {
    const [allSwaps, setAllSwaps] = useState<Swap[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    //as soon as we know the wallet, show cached swaps immediately.
    useEffect(() => {
        if (!walletAddress) return;
        getCachedSwaps(walletAddress).then((cached) => {
            if (cached.length > 0) setAllSwaps(cached);
        });
    }, [walletAddress]);

    // quietly fetch the newest swaps and merge them in.
    const { isLoading: isInitialLoading } = useQuery({
        queryKey: ['swapHistoryLatest', walletAddress],
        queryFn: async () => {
            const latest = await fetchSwapHistoryPage(walletAddress!, null);
            if (walletAddress) await saveSwaps(walletAddress, latest);
            setAllSwaps((prev) => mergeSwaps(prev, latest));
            return latest;
        },
        enabled: !!walletAddress,
        staleTime: 60_000, // check for new swaps once a minute at most
    });

    // "Load more" fetches older swaps, using the oldest one we
    // currently have as the cursor, and also saves them to the cache.
    async function loadMore() {
        if (!walletAddress || allSwaps.length === 0) return;
        setIsLoadingMore(true);

        const oldestTimestamp = allSwaps[allSwaps.length - 1].timestamp;
        const olderPage = await fetchSwapHistoryPage(walletAddress, oldestTimestamp);

        if (olderPage.length === 0) {
            setHasMore(false);
        } else {
        await saveSwaps(walletAddress, olderPage);
            setAllSwaps((prev) => mergeSwaps(prev, olderPage));
        }

        setIsLoadingMore(false);
    }

    return {
        swaps: allSwaps,
        loadMore,
        hasMore,
        isLoading: isInitialLoading || isLoadingMore,
    };
}
