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

// src/lib/auth.ts — updated to check explicit staleness too
export async function requireSession(): Promise<RequireSessionResult> {
  const session = await getSession();

  if (!session.siwe) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const ageMs = Date.now() - session.siwe.issuedAt;
  const maxAgeMs = 60 * 60 * 24 * 1000;

  if (ageMs > maxAgeMs) {
    session.destroy();
    await session.save();
    return {
      session: null,
      error: NextResponse.json({ error: 'Session expired' }, { status: 401 }),
    };
  }

  return { session: session.siwe, error: null };
}
