// src/components/TransactionHydrator.tsx
'use client';

import { useTransactionStore } from '@/lib/stores/transaction-store';
import { useEffect } from 'react';

export function TransactionHydrator() {
    const hydrate = useTransactionStore((state) => state.hydrate);
    const hydrated = useTransactionStore((state) => state.hydrated);

    useEffect(() => {
        if (!hydrated) hydrate();
    }, [hydrated, hydrate]);

    return null; // side-effect-only, same pattern as AccountEffects from Milestone 1
}
