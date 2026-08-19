// src/lib/transactions/gas-history.ts
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { TRANSACTION_CHAIN_ID } from './constants';

const client = createPublicClient({
    chain: baseSepolia,
    transport: http(`/api/rpc/${TRANSACTION_CHAIN_ID}`),
});

// Looks at the last 20 blocks and averages their base fee — a simple,
// honest baseline for "what's normal right now" on this chain.
export async function getRecentAverageBaseFee(): Promise<bigint> {
    const feeHistory = await client.getFeeHistory({
        blockCount: 20,
        rewardPercentiles: [50],
    });

    const fees = feeHistory.baseFeePerGas.filter((fee) => fee !== undefined) as bigint[];
    const sum = fees.reduce((total, fee) => total + fee, BigInt(0));

    if (fees.length === 0) {
        throw new Error('No base fee data available — RPC may be having issues');
    }
    return sum / BigInt(fees.length);
}

export function isGasAbnormallyHigh(currentFee: bigint, averageFee: bigint): boolean {
    if (averageFee === BigInt(0)) return false;
    // "More than double the recent average" — matches your spec's ">2x normal" rule
    return currentFee > averageFee * BigInt(2);
}
