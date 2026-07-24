// src/components/SignInButton.tsx
'use client';

import { buildSiweMessage } from '@/lib/siwe';
import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

export function SignInButton() {
    const { address, chainId, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [status, setStatus] = useState<'idle' | 'signing' | 'error'>('idle');

    async function handleSignIn() {
        if (!address || !chainId) return;

        setStatus('signing');

        try {
            const nonceRes = await fetch('/api/auth/nonce');
            const { nonce } = await nonceRes.json();

            const message = buildSiweMessage({ address, chainId, nonce });

            // This is the line that pops the wallet's signing prompt
            const signature = await signMessageAsync({ message });

            console.log('Got signature:', signature);
            // Step 3 wires this into POST /api/auth/verify
            setStatus('idle');
        } catch (err) {
            console.error('Sign-in failed:', err);
            setStatus('error');
        }
    }

    if (!isConnected) return null;

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
