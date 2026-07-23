// src/components/AccountEffects.tsx
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAccountEffect } from 'wagmi';

export function AccountEffects() {
  const queryClient = useQueryClient();

  useAccountEffect({
    onConnect({ address, chainId, isReconnected }) {
      console.log(`Connected: ${address} on chain ${chainId} (reconnected: ${isReconnected})`);
      // Milestone 2 will extend this: check whether this address matches
      // an existing SIWE session, and prompt re-auth if it doesn't.
    },
    onDisconnect() {
      console.log('Disconnected — clearing all cached wallet-scoped query data');
      queryClient.clear();
    },
  });

  return null; // side-effect-only component, renders nothing
}
