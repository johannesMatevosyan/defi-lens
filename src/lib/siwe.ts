// src/lib/siwe.ts
import { createSiweMessage } from 'viem/siwe';

export function buildSiweMessage({
  address,
  chainId,
  nonce,
}: {
  address: `0x${string}`;
  chainId: number;
  nonce: string;
}) {
    return createSiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to DeFi Lens',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
        issuedAt: new Date(),
    });
}
