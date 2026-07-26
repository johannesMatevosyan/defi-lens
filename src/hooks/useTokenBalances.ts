// src/hooks/useTokenBalances.ts
'use client';

import type { Token } from '@/lib/portfolio/types';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

async function fetchTokenBalances(address: string, chainId: number): Promise<Token[]> {
    const res = await fetch(`/api/portfolio/tokens?address=${address}&chainId=${chainId}`);
    if (!res.ok) throw new Error('Failed to fetch token balances');
    const data = await res.json();
    return data.tokens.map((t: any) => ({ ...t, balance: BigInt(t.balance) }));
}

export function useTokenBalances(chainId: number) {
    const { address, isConnected } = useAccount();

    const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    return useQuery({
        queryKey: ['tokenBalances', chainId, testAddress],
        queryFn: () => fetchTokenBalances(testAddress!, chainId),
        enabled: isConnected && !!testAddress,
        staleTime: chainId === 8453 ? 2_000 : 12_000, // Base vs Ethereum block time, from Step 1
    });
}
