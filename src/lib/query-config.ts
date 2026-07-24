// src/lib/query-config.ts
export const STALE_TIME = {
    ethBalance: 12_000,      // ~1 Ethereum block (12s average block time)
    baseBalance: 2_000,      // ~1 Base block (2s average block time)
    tokenPrice: 60_000,      // CoinGecko free tier: 30 calls/min — don't hammer it
    transactionHistory: 5 * 60_000, // past transactions don't change once confirmed
} as const;
