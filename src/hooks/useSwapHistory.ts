// src/hooks/useSwapHistory.ts
'use client';

import { useQuery } from '@tanstack/react-query';

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

async function fetchSwapHistory(walletAddress: string): Promise<Swap[]> {
    const res = await fetch('/api/graph/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
    });
    if (!res.ok) throw new Error('Failed to fetch swap history');
    const data = await res.json();
    return data.swaps;
}

export function useSwapHistory(walletAddress?: string) {
    return useQuery({
        queryKey: ['swapHistory', walletAddress],
        queryFn: () => fetchSwapHistory(walletAddress!),
        enabled: !!walletAddress,
        staleTime: 5 * 60_000, // past swaps don't change
    });
}
