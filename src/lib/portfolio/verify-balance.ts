// src/lib/portfolio/verify-balance.ts
import { createPublicClient, erc20Abi, http } from 'viem';
import { base } from 'viem/chains';

const verifyClient = createPublicClient({
    chain: base,
    transport: http(`https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

export async function verifyTokenBalance(
  contractAddress: `0x${string}`,
  walletAddress: `0x${string}`
): Promise<bigint> {
    return verifyClient.readContract({
        address: contractAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [walletAddress],
    });
}
