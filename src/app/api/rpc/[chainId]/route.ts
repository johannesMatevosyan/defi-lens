// src/app/api/rpc/[chainId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Maps wagmi/viem chain IDs to Alchemy's per-network subdomain
const ALCHEMY_NETWORK_BY_CHAIN_ID: Record<number, string> = {
  8453: 'base-mainnet',
  1: 'eth-mainnet',
  84532: 'base-sepolia',
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> }
) {
  const { chainId } = await params;
  const network = ALCHEMY_NETWORK_BY_CHAIN_ID[Number(chainId)];

  if (!network) {
    return NextResponse.json(
      { error: `Unsupported chainId: ${chainId}` },
      { status: 400 }
    );
  }

  const alchemyUrl = `https://${network}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  const body = await request.text(); // forward the raw JSON-RPC payload as-is

  try {
    const alchemyResponse = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      // Keep this fast — if Alchemy is slow/down, we want viem's fallback
      // transport to move on to the public RPC quickly, not hang.
      signal: AbortSignal.timeout(5000),
    });

    const data = await alchemyResponse.json();
    return NextResponse.json(data, { status: alchemyResponse.status });
  } catch (error) {
    // Network error or timeout — return a JSON-RPC-shaped error so viem
    // can recognize the failure and fall back cleanly.
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32603, message: 'RPC proxy error' }, id: null },
      { status: 502 }
    );
  }
}
