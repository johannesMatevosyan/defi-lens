// src/components/layout/Header.tsx
'use client';

import { SignInButton } from '@/components/SignInButton';
import { WalletInfo } from '@/components/WalletInfo';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
    return (
        <header className="flex items-center justify-end border-b border-border bg-surface px-6 py-3">
            <div className="flex items-center gap-3">
                <ConnectButton.Custom>
                    {({ account, openConnectModal, openChainModal, mounted }) => {
                        const connected = mounted && !!account;

                        if (!connected) {
                            return (
                                <button
                                    onClick={openConnectModal}
                                    className="rounded bg-black px-4 py-2 text-sm text-white"
                                >
                                    Connect Wallet
                                </button>
                            );
                        }

                        return (
                            <>
                                <WalletInfo onSwitchNetwork={openChainModal} />
                                <SignInButton />
                            </>
                        );
                    }}
                </ConnectButton.Custom>
            </div>
        </header>
    );
}
