// src/lib/portfolio/multicall-adapter.ts
import { erc20Abi, type Address } from 'viem';
import type { Token } from './types';
import { getServerPublicClient } from './viem-clients';

export async function getTokenDataViaMulticall(
  contractAddresses: Address[],
  walletAddress: Address,
  chainId: number
): Promise<Token[]> {
    const client = getServerPublicClient(chainId);

    // Flatten into one contracts array: 4 calls per token, all batched together
    const contracts = contractAddresses.flatMap(
        (address) =>
        [
            { address, abi: erc20Abi, functionName: 'symbol' },
            { address, abi: erc20Abi, functionName: 'name' },
            { address, abi: erc20Abi, functionName: 'decimals' },
            { address, abi: erc20Abi, functionName: 'balanceOf', args: [walletAddress] },
        ] as const
    );

    // allowFailure: true is critical — some tokens are non-standard and will
    // revert on symbol()/name() (see explanation below). One bad token
    // shouldn't fail the entire batch.
    const results = await client.multicall({ contracts, allowFailure: true });

    return contractAddresses.map((contractAddress, i) => {
        const [symbolRes, nameRes, decimalsRes, balanceRes] = results.slice(i * 4, i * 4 + 4);

        return {
            contractAddress,
            symbol: symbolRes.status === 'success' ? (symbolRes.result as string) : 'UNKNOWN',
            name: nameRes.status === 'success' ? (nameRes.result as string) : 'Unknown Token',
            decimals: decimalsRes.status === 'success' ? (decimalsRes.result as number) : 18,
            balance: balanceRes.status === 'success' ? (balanceRes.result as bigint) : BigInt(0),
            chainId,
        };
    });
}
