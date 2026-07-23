// src/components/ConnectWalletButton.tsx
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function ConnectWalletButton() {
    return (
        <ConnectButton
            showBalance={false}     // we'll build our own balance display in Step 5
            chainStatus="icon"      // small chain icon instead of full name — compact header
            accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
            }}
        />
    );
}
