'use client';

import { AccountEffects } from '@/components/AccountEffects';
import { TransactionHydrator } from '@/components/TransactionHydrator';
import { wagmiConfig } from '@/lib/wagmi-config';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WagmiProvider } from 'wagmi';

const dashboardTheme = darkTheme({
  accentColor: '#10B981',
  accentColorForeground: '#030712',
  borderRadius: 'medium',
  overlayBlur: 'small',
});

export function Providers({ children }: { children: React.ReactNode }) {
    // useState (not module-level) so each user gets their own QueryClient —
    // critical in any server-rendered React app to avoid cross-request cache leaks
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000, // 30s default — safe middle ground until overridden
                        gcTime: 5 * 60_000, // 5 min — how long unused data stays in memory before eviction
                        retry: 2,
                        refetchOnWindowFocus: true,
                    },
                },
        })
    );

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={dashboardTheme}>
                    <AccountEffects />
                    <TransactionHydrator />
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
