// src/components/ChainBreakdownChart.tsx
'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ChainBreakdownChartProps {
    chainTotals: { 8453: number; 1: number };
}

const CHAIN_COLORS: Record<number, string> = {
    8453: '#0052ff', // Base blue
    1: '#627eea', // Ethereum purple-blue
};

const CHAIN_NAMES: Record<number, string> = {
    8453: 'Base',
    1: 'Ethereum',
};

export function ChainBreakdownChart({ chainTotals }: ChainBreakdownChartProps) {
    const data = [
        { chainId: 8453, name: 'Base', value: chainTotals[8453] },
        { chainId: 1, name: 'Ethereum', value: chainTotals[1] },
    ].filter((entry) => entry.value > 0);

    if (data.length === 0) {
        return <p className="text-sm text-zinc-500">No priced holdings to show yet.</p>;
    }

    return (
        <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {data.map((entry) => (
                <Cell key={entry.chainId} fill={CHAIN_COLORS[entry.chainId]} />
                ))}
            </Pie>
            <Tooltip formatter={(value) => value ? `$${Number(value).toFixed(2)}` : '$0.00'} />
            <Legend />
            </PieChart>
        </ResponsiveContainer>
        </div>
    );
}
