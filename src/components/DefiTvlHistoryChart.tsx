// src/components/DefiTvlHistoryChart.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TvlPoint {
    date: number; // unix timestamp, in seconds
    tvl: number;
}

async function fetchHistoricalTvl(): Promise<TvlPoint[]> {
    const res = await fetch('/api/defillama/historical-tvl');
    if (!res.ok) throw new Error('Failed to fetch historical TVL');
    const data = await res.json();
    return data.history;
}

function formatTvl(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${value.toFixed(0)}`;
}

// Turns a unix timestamp (seconds) into a short readable date like "Jan 2024"
function formatDate(timestampSeconds: number): string {
    return new Date(timestampSeconds * 1000).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });
}

export function DefiTvlHistoryChart() {
    const { data: history, isLoading, error } = useQuery({
        queryKey: ['defiTvlHistory'],
        queryFn: fetchHistoricalTvl,
        staleTime: 60 * 60_000, // this barely changes hour to hour, an hour of caching is fine
    });

    if (isLoading) {
        return <div className="h-80 animate-pulse rounded-lg bg-white/5" />;
    }

    if (error || !history) {
        return <p className="text-sm text-red-600">Couldn't load TVL history.</p>;
    }

    // The full history can have thousands of daily points — that's too
    // many to plot cleanly. We thin it out to roughly one point per week.
    const thinned = history.filter((_, index) => index % 7 === 0);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={thinned}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} minTickGap={40} />
                <YAxis tickFormatter={formatTvl} width={60} />
                <Tooltip
                    labelFormatter={(label: any) => typeof label === 'number' ? formatDate(label) : ''}
                    formatter={(value: any) => value !== undefined ? formatTvl(value as number) : null} />
                <Line type="monotone" dataKey="tvl" stroke="#4f46e5" dot={false} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
