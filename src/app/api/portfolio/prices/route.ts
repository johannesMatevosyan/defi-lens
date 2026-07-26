// src/app/api/portfolio/prices/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_BY_CHAIN_ID: Record<number, string> = {
    8453: 'base',
    1: 'ethereum',
    // Base Sepolia has no real market — testnet tokens aren't priced on CoinGecko
};

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        const res = await fetch(url, options);

        if (res.ok) return res;

        // 429 = rate limited. Back off exponentially: 500ms, 1000ms, 2000ms...
        // rather than hammering an already-throttled endpoint harder.
        if (res.status === 429 && attempt < retries) {
            const delayMs = 500 * 2 ** attempt;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
        }

        return res; // some other error — let the caller handle it
    }
  throw new Error('Retry attempts exhausted');
}

export async function POST(request: NextRequest) {
    const { contractAddresses, chainId } = await request.json();

    const platform = PLATFORM_BY_CHAIN_ID[chainId];
    if (!platform || !Array.isArray(contractAddresses) || contractAddresses.length === 0) {
        return NextResponse.json({ error: 'Invalid platform or contractAddresses' }, { status: 400 });
    }

    const url = new URL(`https://api.coingecko.com/api/v3/simple/token_price/${platform}`);
    url.searchParams.set('contract_addresses', contractAddresses.join(','));
    url.searchParams.set('vs_currencies', 'usd');

    try {
        const res = await fetchWithRetry(url.toString(), {
            headers: {
                'x-cg-demo-api-key': process.env.COINGECKO_API_KEY!,
                Accept: 'application/json',
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
            console.error('CoinGecko error:', res.status, await res.text());
            return NextResponse.json({ error: 'CoinGecko API error' }, { status: 502 });
        }

        const data: Record<string, { usd?: number }> = await res.json();

        // CoinGecko simply OMITS any contract it doesn't recognize from the
        // response object — it doesn't error, it just silently leaves gaps.
        // We make that explicit by mapping every requested address to either
        // a real price or `null`, so downstream code never has to guess
        // whether a missing key means "no price" or "request failed."
        const prices: Record<string, number | null> = {};
        for (const address of contractAddresses) {
            const lower = address.toLowerCase();
            prices[address] = data[lower]?.usd ?? null;
        }

        return NextResponse.json({ prices });
    } catch (error) {
        console.error('Price fetch failed:', error);
        return NextResponse.json({ error: 'Failed to fetch token prices' }, { status: 502 });
    }
}
