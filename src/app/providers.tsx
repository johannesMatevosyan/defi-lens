'use client';

import { AccountEffects } from '@/components/AccountEffects';
import { wagmiConfig } from '@/lib/wagmi-config';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WagmiProvider } from 'wagmi';

export function Providers({ children }: { children: React.ReactNode }) {
    // useState (not module-level) so each user gets their own QueryClient —
    // critical in any server-rendered React app to avoid cross-request cache leaks
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <AccountEffects />
                    {children}
                    </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
