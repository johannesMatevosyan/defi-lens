// src/app/api/graph/swaps/route.ts
import { NextRequest, NextResponse } from 'next/server';

const UNISWAP_V3_BASE_SUBGRAPH_ID = 'D1VHPU6cXXSC8eaApWCjCnPcTZQFSYCpGoDAvt4ogDWh';

export async function POST(request: NextRequest) {
    const { walletAddress, first = 20, skip = 0 } = await request.json();

    const url = `https://gateway.thegraph.com/api/${process.env.GRAPH_API_KEY}/subgraphs/id/${UNISWAP_V3_BASE_SUBGRAPH_ID}`;

    const query = `
        query GetSwaps($wallet: String!, $first: Int!, $skip: Int!) {
        swaps(
            first: $first
            skip: $skip
            orderBy: timestamp
            orderDirection: desc
            where: { origin: $wallet }
        ) {
            id
            timestamp
            amount0
            amount1
            amountUSD
            transaction {
                id
            }
            token0 {
                symbol
                decimals
            }
            token1 {
                symbol
                decimals
            }
        }
        }
    `;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                variables: { wallet: walletAddress.toLowerCase(), first, skip },
            }),
            signal: AbortSignal.timeout(8000),
        });

        const data = await res.json();

        if (data.errors) {
            console.error('Graph query errors:', data.errors);
            return NextResponse.json({ error: 'Subgraph query failed' }, { status: 502 });
        }

        return NextResponse.json({ swaps: data.data.swaps });
    } catch (error) {
        console.error('Graph request failed:', error);
        return NextResponse.json({ error: 'Failed to fetch swap history' }, { status: 502 });
    }
}
