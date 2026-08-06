// src/hooks/useTokenBalances.ts
'use client';

import { getCachedSnapshot, setCachedSnapshot } from '@/lib/cache/portfolio-db';
import type { Token } from '@/lib/portfolio/types';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

async function fetchTokenBalances(address: string, chainIdNumber: string | number): Promise<Token[]> {
    const cacheKey = `tokens-${address}-${chainIdNumber}`;
    const chainId = typeof chainIdNumber === 'string' ? parseInt(chainIdNumber, 10) : chainIdNumber;

    // Try IndexedDB first — this survives page reloads and closed tabs,
    // unlike TanStack Query's in-memory cache which resets on refresh.
    const cached = await getCachedSnapshot<Token[]>(cacheKey, 5 * 60_000);

    if (cached) {
        // Return cached data immediately, but still refetch in the background
        // to keep it honest — this is a "stale-while-revalidate" pattern.
        fetchAndCache(address, chainId, cacheKey);
        return cached.map((t: any) => ({ ...t, balance: BigInt(t.balance) }));
    }

    return fetchAndCache(address, chainId, cacheKey);
}

async function fetchAndCache(address: string, chainId: number, cacheKey: string): Promise<Token[]> {
    const res = await fetch(`/api/portfolio/tokens?address=${address}&chainId=${chainId}`);

    if (!res.ok) throw new Error('Failed to fetch token balances');

    const data = await res.json();

    // Store with balance as string (bigint-safe for IndexedDB's structured
    // clone too, in principle bigint IS structured-clonable — but keeping
    // it a string here matches the same shape our Route Handler already
    // sends, avoiding two different serialization conventions.)
    await setCachedSnapshot(cacheKey, data.tokens);

    return data.tokens.map((t: any) => ({ ...t, balance: BigInt(t.balance) }));
}

export function useTokenBalances(chainId: number) {
    const { address, isConnected } = useAccount();

    return useQuery({
        queryKey: ['tokenBalances', chainId, address],
        queryFn: () => fetchTokenBalances(address!, chainId),
        enabled: isConnected && !!address,
        staleTime: chainId === 8453 ? 2_000 : 12_000, // Base vs Ethereum block time, from Step 1
    });
}
