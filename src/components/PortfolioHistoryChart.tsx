// src/components/PortfolioHistoryChart.tsx
'use client';

import { getPortfolioHistory } from '@/lib/cache/portfolio-history-db';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAccount } from 'wagmi';

export function PortfolioHistoryChart() {
    const { address } = useAccount();
    const [history, setHistory] = useState<{ date: string; totalUsd: number }[]>([]);

    useEffect(() => {
        if (!address) return;
        getPortfolioHistory(address).then(setHistory);
    }, [address]);

    if (history.length === 0) {
        return (
            <p className="text-sm text-zinc-500 py-4">
                Come back tomorrow to start seeing your portfolio value change over time.
            </p>
        );
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${v.toFixed(0)}`} width={60} />
                    <Tooltip formatter={(value) => value ? `$${Number(value).toFixed(2)}` : '$0.00'} />
                    <Area type="monotone" dataKey="totalUsd" stroke="#4f46e5" fill="#c7d2fe" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
