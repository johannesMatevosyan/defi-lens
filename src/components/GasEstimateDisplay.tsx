// src/components/GasEstimateDisplay.tsx
'use client';

import { estimateTransferGas, type GasEstimate } from '@/lib/transactions/estimate-gas';
import { useEffect, useState } from 'react';

interface Props {
  from: `0x${string}`;
  to: `0x${string}`;
  data: `0x${string}`;
  ethPriceUsd: number | null;
}

export function GasEstimateDisplay({ from, to, data, ethPriceUsd }: Props) {
    const [estimate, setEstimate] = useState<GasEstimate | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        estimateTransferGas({ from, to, data })
        .then(setEstimate)
        .catch(() => setError('Could not estimate gas'));
    }, [from, to, data]);

    if (error) return <p className="text-sm text-red-600">{error}</p>;
    if (!estimate) return <p className="text-sm text-zinc-500">Estimating gas…</p>;

    const usdCost = ethPriceUsd !== null ? Number(estimate.estimatedCostEth) * ethPriceUsd : null;

    return (
        <div className="rounded-lg border p-3 text-sm">
            <div className="flex justify-between">
                <span className="text-zinc-500">Estimated gas cost</span>
                <span className="font-medium">
                    {Number(estimate.estimatedCostEth).toFixed(6)} ETH
                    {usdCost !== null && ` (~$${usdCost.toFixed(2)})`}
                </span>
            </div>
        </div>
    );
}
