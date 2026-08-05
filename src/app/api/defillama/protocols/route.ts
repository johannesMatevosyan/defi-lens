// src/app/api/defillama/protocols/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('https://api.llama.fi/protocols', {
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'DefiLlama request failed' }, { status: 502 });
        }

        const allProtocols = await res.json();

        // The full list is huge (thousands of protocols) — we only need
        // the top ones, sorted by TVL, highest first.
        const topProtocols = allProtocols
        .filter((p: any) => p.category !== 'CEX') // exclude centralized exchanges
        .sort((a: any, b: any) => b.tvl - a.tvl)
        .slice(0, 20)
        .map((p: any) => ({
            name: p.name,
            symbol: p.symbol,
            category: p.category,
            tvl: p.tvl,
            chain: p.chain,
            change1d: p.change_1d,
        }));

        return NextResponse.json({ protocols: topProtocols });
    } catch (error) {
        console.error('DefiLlama protocols fetch failed:', error);
        return NextResponse.json({ error: 'Failed to fetch protocols' }, { status: 502 });
    }
}
