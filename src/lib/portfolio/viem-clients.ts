// src/lib/portfolio/viem-clients.ts
import { createPublicClient, http, type Chain } from 'viem';
import { base, baseSepolia, mainnet } from 'viem/chains';

const CHAINS: Record<number, Chain> = {
    [base.id]: base,
    [mainnet.id]: mainnet,
    [baseSepolia.id]: baseSepolia,
};

const ALCHEMY_NETWORK_BY_CHAIN_ID: Record<number, string> = {
    8453: 'base-mainnet',
    1: 'eth-mainnet',
    84532: 'base-sepolia',
};

const clientCache = new Map<number, ReturnType<typeof createPublicClient>>();

export function getServerPublicClient(chainId: number) {
    const cached = clientCache.get(chainId);
    if (cached) return cached;

    const chain = CHAINS[chainId];
    const network = ALCHEMY_NETWORK_BY_CHAIN_ID[chainId];
    if (!chain || !network) throw new Error(`Unsupported chainId: ${chainId}`);

    const client = createPublicClient({
        chain,
        transport: http(`https://${network}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
    });

    clientCache.set(chainId, client);
    return client;
}
