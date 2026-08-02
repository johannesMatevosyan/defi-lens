// src/lib/swap-direction.ts
import type { Swap } from '@/hooks/useSwapHistory';

export function getSwapDirection(swap: Swap) {
    const amount0 = Number(swap.amount0);

    // If amount0 is negative, the wallet RECEIVED token0 and GAVE token1.
    // If amount0 is positive, the wallet GAVE token0 and RECEIVED token1.
    if (amount0 < 0) {
        return {
            received: { symbol: swap.token0.symbol, amount: Math.abs(amount0) },
            gave: { symbol: swap.token1.symbol, amount: Number(swap.amount1) },
        };
    }

    return {
        received: { symbol: swap.token1.symbol, amount: Math.abs(Number(swap.amount1)) },
        gave: { symbol: swap.token0.symbol, amount: amount0 },
    };
}
