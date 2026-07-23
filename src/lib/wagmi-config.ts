// src/lib/wagmi-config.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { fallback, http } from 'wagmi';
import { base, baseSepolia, mainnet } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'DeFi Lens',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [base, mainnet, baseSepolia],
  wallets: [
    { groupName: 'Recommended', wallets: [metaMaskWallet, walletConnectWallet] },
  ],
  transports: {
    [base.id]: fallback([
      http('/api/rpc/8453', { retryCount: 1, timeout: 5_000 }),
      http('https://mainnet.base.org'),
    ]),
    [mainnet.id]: fallback([
      http('/api/rpc/1', { retryCount: 1, timeout: 5_000 }),
      http('https://ethereum-rpc.publicnode.com'),
    ]),
    [baseSepolia.id]: fallback([
      http('/api/rpc/84532', { retryCount: 1, timeout: 5_000 }),
      http('https://sepolia.base.org'),
    ]),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
