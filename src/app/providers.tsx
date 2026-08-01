'use client';

import { AccountEffects } from '@/components/AccountEffects';
import { FakeTransactionTester } from '@/components/FakeTransactionTester';
import { TransactionHydrator } from '@/components/TransactionHydrator';
import { TransactionList } from '@/components/TransactionList';
import { wagmiConfig } from '@/lib/wagmi-config';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';

const ReactQueryDevtoolsPanel = dynamic(
    () => import('@tanstack/react-query-devtools/production').then((mod) => mod.ReactQueryDevtoolsPanel),
    { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [showDevtools, setShowDevtools] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                <RainbowKitProvider>
                    <AccountEffects />
                    <TransactionHydrator />
                    <FakeTransactionTester />
                    <TransactionList />
                    {children}
                </RainbowKitProvider>
                {mounted ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setShowDevtools((prev) => !prev)}
                            className="fixed bottom-4 left-4 z-[99999] rounded-md border border-zinc-300 bg-white/95 px-3 py-2 text-xs font-semibold text-zinc-900 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-100"
                        >
                            {showDevtools ? 'Hide Query Devtools' : 'Show Query Devtools'}
                        </button>

                        {showDevtools ? (
                            <div className="fixed bottom-16 left-4 z-[99999] h-[60vh] max-h-[700px] w-[min(90vw,48rem)] overflow-hidden rounded-xl border border-zinc-300 bg-white/95 shadow-2xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
                                <ReactQueryDevtoolsPanel style={{ height: '100%', width: '100%' }} />
                            </div>
                        ) : null}
                    </>
                ) : null}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
