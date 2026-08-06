// src/hooks/useMultiChainPortfolio.ts
'use client';

import type { Token } from '@/lib/portfolio/types';
import { formatUnits } from 'viem';
import { useTokenBalances } from './useTokenBalances';
import { useTokenPrices } from './useTokenPrices';

export interface TokenWithValue extends Token {
    usdValue: number | null;
}

export function useMultiChainPortfolio() {
    const base = useTokenBalances(8453);
    const ethereum = useTokenBalances(1);

    const baseAddresses = base.data?.map((t) => t.contractAddress) ?? [];
    const ethAddresses = ethereum.data?.map((t) => t.contractAddress) ?? [];

    const basePrices = useTokenPrices(baseAddresses, 8453);
    const ethPrices = useTokenPrices(ethAddresses, 1);

    const isLoading = base.isLoading || ethereum.isLoading || basePrices.isLoading || ethPrices.isLoading;

    // Combine both chains' tokens into one list, attaching the USD value
    // to each one. Every token remembers which chain it came from —
    // this is what lets us tell two "USDC"s (one on each chain) apart.
    function tokensWithValue(tokens: Token[] | undefined, prices: Record<string, number | null> | undefined): TokenWithValue[] {
        return (tokens ?? []).map((token) => {
            const price = prices?.[token.contractAddress] ?? null;
            const usdValue =
                price !== null ? Number(formatUnits(token.balance, token.decimals)) * price : null;
            return { ...token, usdValue };
        });
    }

    const baseTokens = tokensWithValue(base.data, basePrices.data);
    const ethTokens = tokensWithValue(ethereum.data, ethPrices.data);

    const allTokens = [...baseTokens, ...ethTokens];

    const chainTotals = {
        8453: baseTokens.reduce((sum, t) => sum + (t.usdValue ?? 0), 0),
        1: ethTokens.reduce((sum, t) => sum + (t.usdValue ?? 0), 0),
    };

    const grandTotal = chainTotals[8453] + chainTotals[1];

    return { allTokens, chainTotals, grandTotal, isLoading };
}
