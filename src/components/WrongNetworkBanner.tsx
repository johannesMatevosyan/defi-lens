// src/components/WrongNetworkBanner.tsx
'use client';

import { wagmiConfig } from '@/lib/wagmi-config';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

const supportedChainIds = wagmiConfig.chains.map((c) => c.id);

export function WrongNetworkBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isWrongNetwork = isConnected && !supportedChainIds.includes(chainId);

  if (!isWrongNetwork) return null;

  return (
    <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
      <span>You're connected to an unsupported network.</span>
      <button
        onClick={() => switchChain({ chainId: base.id })}
        disabled={isPending}
        className="rounded bg-amber-600 px-3 py-1 text-white disabled:opacity-50"
      >
        {isPending ? 'Switching…' : 'Switch to Base'}
      </button>
    </div>
  );
}
