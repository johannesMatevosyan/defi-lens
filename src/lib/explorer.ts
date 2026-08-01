// src/lib/explorer.ts
const EXPLORER_BASE_URL: Record<number, string> = {
    8453: 'https://basescan.org',
    1: 'https://etherscan.io',
    84532: 'https://sepolia.basescan.org',
};

export function getExplorerTxUrl(chainId: number, hash: string): string | null {
    const base = EXPLORER_BASE_URL[chainId];
    return base ? `${base}/tx/${hash}` : null;
}
