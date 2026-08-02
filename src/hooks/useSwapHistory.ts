// src/hooks/useSwapHistory.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

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

export function useSwapHistoryPaginated(walletAddress?: string) {
    const [allSwaps, setAllSwaps] = useState<Swap[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const { isLoading: isInitialLoading } = useQuery({
        queryKey: ['swapHistoryPage', walletAddress, 'initial'],
        queryFn: async () => {
        const firstPage = await fetchSwapHistoryPage(walletAddress!, null);
        setAllSwaps(firstPage);
        if (firstPage.length > 0) {
            setCursor(firstPage[firstPage.length - 1].timestamp);
        } else {
            setHasMore(false);
        }
            return firstPage;
        },
        enabled: !!walletAddress,
        staleTime: 5 * 60_000,
    });

    async function loadMore() {
        if (!walletAddress || !cursor) return;
        setIsLoadingMore(true);

        const newPage = await fetchSwapHistoryPage(walletAddress, cursor);

        if (newPage.length === 0) {
            setHasMore(false);
        } else {
            setAllSwaps((prev) => [...prev, ...newPage]);
            setCursor(newPage[newPage.length - 1].timestamp);
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
