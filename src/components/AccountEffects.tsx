// src/components/AccountEffects.tsx
'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAccountEffect } from 'wagmi';

export function AccountEffects() {
  const queryClient = useQueryClient();

  useAccountEffect({
    onDisconnect() {
      queryClient.clear();
    },
  });

  return null; // side-effect-only component, renders nothing
}
