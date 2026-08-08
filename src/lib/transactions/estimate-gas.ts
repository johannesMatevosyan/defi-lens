// src/lib/transactions/estimate-gas.ts
import { createPublicClient, formatEther, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { TRANSACTION_CHAIN_ID } from './constants';

const client = createPublicClient({
    chain: baseSepolia,
    transport: http(`/api/rpc/${TRANSACTION_CHAIN_ID}`),
});

export interface GasEstimate {
    gasLimit: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    estimatedCostWei: bigint;
    estimatedCostEth: string;
}

export async function estimateTransferGas({
  from,
  to,
  data,
}: {
  from: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
}): Promise<GasEstimate> {
  // Ask the network for current fee conditions
  const feeData = await client.estimateFeesPerGas();

  // Ask how much gas THIS specific call would actually use
  const gasLimit = await client.estimateGas({ account: from, to, data });

  // Add a 20% safety buffer — network conditions can shift slightly
  // between estimating and actually broadcasting the transaction.
  const bufferedGasLimit = (gasLimit * BigInt(120)) / BigInt(100);

  const estimatedCostWei = bufferedGasLimit * feeData.maxFeePerGas;

  return {
        gasLimit: bufferedGasLimit,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        estimatedCostWei,
        estimatedCostEth: formatEther(estimatedCostWei),
  };
}
