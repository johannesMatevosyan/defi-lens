// src/lib/portfolio/alchemy-adapter.ts
import type { WalletPortfolioProvider } from './types';

export const alchemyTokenAdapter: WalletPortfolioProvider = {
    async getTokenBalances(address, chainId) {
        const res = await fetch(`/api/portfolio/tokens?address=${address}&chainId=${chainId}`);
        if (!res.ok) throw new Error('Failed to fetch token balances');
        const data = await res.json();
        // BigInt doesn't survive JSON serialization — reconstruct it here
        return data.tokens.map((t: any) => ({ ...t, balance: BigInt(t.balance) }));
    },
};
