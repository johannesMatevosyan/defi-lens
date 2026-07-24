// src/app/api/protected/whoami/route.ts
// TODO you can delete once Milestone 3's real
import { requireSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    const { session, error } = await requireSession();
    if (error) return error;

    // TypeScript now knows `session` is non-null here — the early
    // return above narrows the discriminated union type.
    return NextResponse.json({ address: session.address, chainId: session.chainId });
}
