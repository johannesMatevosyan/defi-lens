// src/components/FakeTransactionTester.tsx — TEMPORARY, for testing this step only
'use client';

import { useTransactionStore } from '@/lib/stores/transaction-store';

export function FakeTransactionTester() {
    const startTransaction = useTransactionStore((state) => state.startTransaction);
    const updateStatus = useTransactionStore((state) => state.updateStatus);

    async function runFakeFlow() {
        const id = startTransaction({
            chainId: 84532,
            description: 'Test: fake transfer'
        });

        await new Promise((r) => setTimeout(r, 800));
        updateStatus(id, 'awaiting-signature');

        await new Promise((r) => setTimeout(r, 800));
        updateStatus(id, 'broadcasting');

        await new Promise((r) => setTimeout(r, 800));
        updateStatus(id, 'pending', { hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd' });

        await new Promise((r) => setTimeout(r, 1500));
        updateStatus(id, 'confirmed');
    }

    return (
        <button onClick={runFakeFlow} className="rounded bg-black px-3 py-1.5 text-sm text-white">
            Run fake transaction flow
        </button>
    );
}
