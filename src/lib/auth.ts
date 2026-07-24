// src/lib/auth.ts
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

interface AuthenticatedSession {
    address: string;
    chainId: number;
}

type RequireSessionResult =
  | { session: AuthenticatedSession; error: null }
  | { session: null; error: NextResponse };

export async function requireSession(): Promise<RequireSessionResult> {
    const session = await getSession();

    if (!session.siwe) {
        return {
            session: null,
            error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
    }

    return { session: session.siwe, error: null };
}
