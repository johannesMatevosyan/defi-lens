// src/app/api/defillama/historical-tvl/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const res = await fetch('https://api.llama.fi/v2/historicalChainTvl', {
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'DefiLlama request failed' }, { status: 502 });
        }

        const history = await res.json();

        return NextResponse.json({ history });
    } catch (error) {
        console.error('DefiLlama historical TVL fetch failed:', error);
        return NextResponse.json({ error: 'Failed to fetch historical TVL' }, { status: 502 });
    }
}
