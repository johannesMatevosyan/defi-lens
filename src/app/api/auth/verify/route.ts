// src/app/api/auth/verify/route.ts
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { parseSiweMessage, validateSiweMessage } from 'viem/siwe';

// A plain mainnet client for signature recovery — separate from your
// wagmi-config transports, since this runs server-side and needs no
// wallet/browser context, just an RPC endpoint to verify against.
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
});

export async function POST(request: NextRequest) {
    const { message, signature } = await request.json();

    const session = await getSession();

    if (!session.nonce) {
        return NextResponse.json({ error: 'No nonce found — request a new one' }, { status: 400 });
    }

    const siweMessage = parseSiweMessage(message);

    // Structural checks: correct domain, nonce matches what THIS session
    // issued, and the message hasn't expired.
    const isValidStructure = validateSiweMessage({
        message: siweMessage,
        domain: request.headers.get('host') ?? undefined,
        nonce: session.nonce,
    });

    if (!isValidStructure) {
        return NextResponse.json({ error: 'Invalid SIWE message' }, { status: 401 });
    }

    // Cryptographic check: does the signature actually recover to the
    // address claimed in the message?
    const isValidSignature = await publicClient.verifyMessage({
        address: siweMessage.address!,
        message,
        signature,
    });

    if (!isValidSignature) {
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    // Success — consume the nonce (single-use) and establish the session
    session.nonce = undefined;
    session.siwe = {
        address: siweMessage.address!,
        chainId: siweMessage.chainId!,
    };
    await session.save();

    return NextResponse.json({ success: true, address: siweMessage.address });
}
