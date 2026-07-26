// src/hooks/useTokenPrices.ts
'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchTokenPrices(
  contractAddresses: string[],
  chainId: number
): Promise<Record<string, number | null>> {
    const res = await fetch('/api/portfolio/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddresses, chainId }),
    });

    if (!res.ok) throw new Error('Failed to fetch token prices');
    const data = await res.json();
    return data.prices;
}

export function useTokenPrices(contractAddresses: string[], chainId: number) {
    return useQuery({
        queryKey: ['tokenPrices', chainId, contractAddresses.sort().join(',')],
        queryFn: () => fetchTokenPrices(contractAddresses, chainId),
        enabled: contractAddresses.length > 0,
        staleTime: 60_000, // prices, from Step 1's config
    });
}
