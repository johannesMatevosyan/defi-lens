// src/lib/transactions/simulate-transfer.ts
import { BaseError, ContractFunctionRevertedError, createPublicClient, erc20Abi, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { TRANSACTION_CHAIN_ID } from './constants';


const client = createPublicClient({
    chain: baseSepolia,
    transport: http(`/api/rpc/${TRANSACTION_CHAIN_ID}`), // our own proxy — key stays server-side
});

export interface SimulationResult {
    success: boolean;
    request?: any; // the ready-to-sign request, if successful
    revertReason?: string;
}

export async function simulateErc20Transfer({
  tokenAddress,
  fromAddress,
  toAddress,
  amount,
}: {
    tokenAddress: `0x${string}`;
    fromAddress: `0x${string}`;
    toAddress: `0x${string}`;
    amount: bigint;
}): Promise<SimulationResult> {
    try {
        const { request } = await client.simulateContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [toAddress, amount],
            account: fromAddress,
        });

        return { success: true, request };
    } catch (error) {
        if (error instanceof BaseError) {
            const revertError = error.walk((e) => e instanceof ContractFunctionRevertedError);

            if (revertError instanceof ContractFunctionRevertedError) {
                const reason = revertError.data?.errorName ?? revertError.shortMessage ?? 'Transaction would revert';
                return { success: false, revertReason: reason };
            }

            return { success: false, revertReason: error.shortMessage ?? 'Simulation failed' };
        }

        return { success: false, revertReason: 'Unknown simulation error' };
    }
}
