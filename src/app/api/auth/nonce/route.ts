// src/app/api/auth/nonce/route.ts
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';
import { generateSiweNonce } from 'viem/siwe';

export async function GET() {
  const nonce = generateSiweNonce();

  const session = await getSession();
  session.nonce = nonce;
  await session.save();

  return NextResponse.json({ nonce });
}
