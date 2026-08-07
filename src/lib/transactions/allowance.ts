// src/lib/transactions/allowance.ts
import { createPublicClient, erc20Abi, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const client = createPublicClient({
    chain: baseSepolia,
    transport: http('/api/rpc/84532'),
});

export async function getAllowance({
  tokenAddress,
  ownerAddress,
  spenderAddress,
}: {
  tokenAddress: `0x${string}`;
  ownerAddress: `0x${string}`;
  spenderAddress: `0x${string}`;
}): Promise<bigint> {
    return client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [ownerAddress, spenderAddress],
    });
}
