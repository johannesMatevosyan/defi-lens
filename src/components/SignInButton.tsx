// src/components/SignInButton.tsx
'use client';

import { useSession } from '@/hooks/useSession';
import { buildSiweMessage } from '@/lib/siwe';
import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

export function SignInButton() {
    const { address, chainId, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [status, setStatus] = useState<'idle' | 'signing' | 'error'>('idle');
    const { isAuthenticated, isLoading, refetch } = useSession();

    async function handleSignIn() {
        if (!address || !chainId) return;

        setStatus('signing');

        try {
            const nonceRes = await fetch('/api/auth/nonce');
            const { nonce } = await nonceRes.json();

            const message = buildSiweMessage({ address, chainId, nonce });

            // This is the line that pops the wallet's signing prompt
            const signature = await signMessageAsync({ message });

            const verifyRes = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, signature }),
            });

            if (!verifyRes.ok) {
                throw new Error('Verification failed');
            }

            await refetch(); // pulls the new session, flips isAuthenticated to true
            setStatus('idle');
        } catch (err) {
            console.error('Sign-in failed:', err);
            setStatus('error');
        }
    }

    if (!isConnected || isLoading) return null;

    if (isAuthenticated) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-green-700">Signed in ✓</span>
                <button
                    onClick={async () => {
                        await fetch('/api/auth/logout', { method: 'POST' });
                        await refetch();
                    }}
                    className="text-sm text-gray-500 underline"
                >
                    Sign out
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleSignIn}
            disabled={status === 'signing'}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
            {status === 'signing' ? 'Check your wallet…' : 'Sign In'}
        </button>
    );
}
