// src/app/api/portfolio/tokens/route.ts
import { getTokenDataViaMulticall } from '@/lib/portfolio/multicall-adapter';
import { NextRequest, NextResponse } from 'next/server';

const ALCHEMY_NETWORK_BY_CHAIN_ID: Record<number, string> = {
  8453: 'base-mainnet',
  1: 'eth-mainnet',
  84532: 'base-sepolia',
};

interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const chainId = Number(searchParams.get('chainId'));

    const network = ALCHEMY_NETWORK_BY_CHAIN_ID[chainId];
    if (!address || !network) {
        return NextResponse.json({ error: 'Missing or unsupported address/chainId' }, { status: 400 });
    }

    const alchemyUrl = `https://${network}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

    try {
        // fitrst call
        const balancesRes = await fetch(alchemyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'alchemy_getTokenBalances',
                params: [address],
            }),
            signal: AbortSignal.timeout(8000),
        });

        // Read the body exactly ONCE, as text, then parse it ourselves.
        // This lets us log the raw text if JSON.parse fails, instead of
        // losing that information the moment .json() throws.
        const rawText = await balancesRes.text();
        const balancesData = JSON.parse(rawText);

        if (!balancesData.result) {
            console.error('Alchemy returned no result field:', balancesData);
            return NextResponse.json({ error: 'Alchemy API error', details: balancesData }, { status: 502 });
        }

        const rawBalances: AlchemyTokenBalance[] = balancesData.result.tokenBalances.filter(
        (t: AlchemyTokenBalance) =>
            t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
        );

        const tokens = await getTokenDataViaMulticall(
            rawBalances.map((b) => b.contractAddress as `0x${string}`),
            address as `0x${string}`,
            chainId
        );

        return NextResponse.json({
            tokens: tokens.map((t) => ({ ...t, balance: t.balance.toString() })),
        });
    } catch (error) {
        console.error('Portfolio tokens fetch failed:', error);
        return NextResponse.json({ error: 'Failed to fetch token balances' }, { status: 502 });
    }
}
