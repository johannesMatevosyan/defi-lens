// src/lib/wagmi-config.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { http } from 'wagmi';
import { base, baseSepolia, mainnet } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'DeFi Lens',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [base, mainnet, baseSepolia],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, walletConnectWallet],
    },
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
