// src/app/api/auth/session/route.ts
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    return NextResponse.json({ session: session.siwe ?? null });
}
