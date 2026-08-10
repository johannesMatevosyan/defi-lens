// src/components/layout/Header.tsx
'use client';

import { SignInButton } from '@/components/SignInButton';
import { WalletInfo } from '@/components/WalletInfo';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
    return (
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
            <div className="flex items-center gap-6 text-xs font-mono text-zinc-400">
                <span>
                    DeFi TVL <span className="text-zinc-200">$92.4B</span>
                </span>
                <span>
                    Gas <span className="text-positive">0.002 Gwei</span>
                </span>
            </div>
            <div className="flex items-center gap-3">
                <WalletInfo />
                <SignInButton />
                <ConnectButton showBalance={false} chainStatus="icon" />
            </div>
        </header>
    );
}
