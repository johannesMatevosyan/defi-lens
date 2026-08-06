// src/components/AssetAllocationChart.tsx
'use client';

import { useMultiChainPortfolio } from '@/hooks/useMultiChainPortfolio';
import { usePortfolioUIStore } from '@/lib/stores/portfolio-ui-store';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// A small set of colors, one per slice. If there are more tokens than
// colors, we just repeat the list from the start.
const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];

export function AssetAllocationChart() {
    const selectedChain = usePortfolioUIStore((state) => state.selectedChain);
    const { allTokens, isLoading } = useMultiChainPortfolio();

    if (isLoading) {
        return <div className="h-64 w-64 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto" />;
    }

    // Filter to the selected chain, same pattern as PortfolioList —
    // 'all' means show everything, otherwise only that chain's tokens.
    const filteredTokens = allTokens.filter((token) =>
        selectedChain === 'all' ? true : token.chainId === selectedChain
    );

    const chartData = filteredTokens
        .filter((token) => token.usdValue !== null && token.usdValue > 0)
        .map((token) => ({ name: token.symbol, value: token.usdValue as number }))
        .sort((a, b) => b.value - a.value);

    if (chartData.length === 0) {
        return <p className="text-sm text-zinc-500">No priced tokens to show yet.</p>;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                        {chartData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => (typeof value === 'number' ? `$${value.toFixed(2)}` : value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
