// src/components/AssetAllocationChart.tsx
'use client';

import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { usePortfolioUIStore } from '@/lib/stores/portfolio-ui-store';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatUnits } from 'viem';

// A small set of colors, one per slice. If there are more tokens than
// colors, we just repeat the list from the start.
const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];

export function AssetAllocationChart() {
    const selectedChain = usePortfolioUIStore((state) => state.selectedChain);
    const { data: tokens, isLoading: tokensLoading } = useTokenBalances(selectedChain);

    const contractAddresses = tokens?.map((t) => t.contractAddress) ?? [];
    const { data: prices, isLoading: pricesLoading } = useTokenPrices(contractAddresses, selectedChain);

    if (tokensLoading || pricesLoading) {
        return <div className="h-64 w-64 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800 mx-auto" />;
    }

    if (!tokens || tokens.length === 0) {
        return <p className="text-sm text-zinc-500">No tokens to show yet.</p>;
    }

    // Turn each token into a { name, value } pair — the shape Recharts
    // expects for a pie/donut chart. We skip anything with no known price,
    // since we can't meaningfully compare its USD value to the others.
    const chartData = tokens
        .map((token) => {
        const price = prices?.[token.contractAddress] ?? null;
        if (price === null) return null;

            const formatted = Number(formatUnits(token.balance, token.decimals));
            const usdValue = formatted * price;

            return { name: token.symbol, value: usdValue };
        })
        .filter((entry): entry is { name: string; value: number } => entry !== null && entry.value > 0)
        .sort((a, b) => b.value - a.value);

    if (chartData.length === 0) {
        return <p className="text-sm text-zinc-500">No priced tokens to show yet.</p>;
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                >
                    {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => value ? `$${Number(value).toFixed(2)}` : 'N/A'} />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
