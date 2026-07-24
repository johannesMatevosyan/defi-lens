// src/lib/session.ts
import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export interface SessionData {
  nonce?: string;
  siwe?: {
    address: string;
    chainId: number;
    issuedAt: number;
  };
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET!,
    cookieName: 'defi-lens-session',
    ttl: SESSION_TTL_SECONDS,
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: SESSION_TTL_SECONDS,
    },
};

export async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}
