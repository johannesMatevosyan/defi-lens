// src/components/ProtocolTvlChart.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Protocol {
    name: string;
    tvl: number;
}

async function fetchTopProtocols(): Promise<Protocol[]> {
    const res = await fetch('/api/defillama/protocols');
    if (!res.ok) throw new Error('Failed to fetch protocols');
    const data = await res.json();
    return data.protocols;
}

function formatTvl(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${value.toFixed(0)}`;
}

export function ProtocolTvlChart() {
  const { data: protocols, isLoading, error } = useQuery({
        queryKey: ['topProtocols'],
        queryFn: fetchTopProtocols,
        staleTime: 5 * 60_000,
  });

  if (isLoading) {
        return <div className="h-80 animate-pulse rounded-lg bg-white/5" />;
  }

  if (error || !protocols) {
        return <p className="text-sm text-red-600">Couldn't load protocol data.</p>;
  }

  const topTen = protocols.slice(0, 10);

  return (
    <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topTen} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={formatTvl} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => formatTvl(typeof value === 'number' ? value : 0)} />
                <Bar dataKey="tvl" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
