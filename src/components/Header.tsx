// src/components/Header.tsx
'use client';

import { ConnectWalletButton } from './ConnectWalletButton';
import { WalletInfo } from './WalletInfo';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <span className="font-semibold">DeFi Lens</span>
      <WalletInfo />
      <ConnectWalletButton />
    </header>
  );
}
