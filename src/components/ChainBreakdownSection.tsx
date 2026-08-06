// src/components/ChainBreakdownSection.tsx
'use client';

import { useMultiChainPortfolio } from '@/hooks/useMultiChainPortfolio';
import { ChainBreakdownChart } from './ChainBreakdownChart';

export function ChainBreakdownSection() {
    const { chainTotals } = useMultiChainPortfolio();
    return <ChainBreakdownChart chainTotals={chainTotals} />;
}
