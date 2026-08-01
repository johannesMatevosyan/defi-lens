// src/components/SimulateTransferTester.tsx — test harness, real chain call
'use client';

import { useTransactionStore } from '@/lib/stores/transaction-store';
import { simulateErc20Transfer } from '@/lib/transactions/simulate-transfer';
import { useAccount } from 'wagmi';

// The well-known Ethereum "burn" address — verified 40 hex chars, correct checksum.
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD' as const;

// A placeholder standing in for "some ERC-20 contract" — using the burn
// address here too is fine for THIS test, since we only want simulation
// to fail (there's no real contract code at this address at all, which
// will produce its own distinct, real error — see note below).
const TEST_TOKEN_ADDRESS = BURN_ADDRESS;

export function SimulateTransferTester() {
    const { address } = useAccount();
    const startTransaction = useTransactionStore((state) => state.startTransaction);
    const updateStatus = useTransactionStore((state) => state.updateStatus);

    async function runSimulation() {
        if (!address) return;

        const id = startTransaction({ chainId: 84532, description: 'Test: simulate transfer' });

        const result = await simulateErc20Transfer({
            tokenAddress: TEST_TOKEN_ADDRESS,
            fromAddress: address,
            toAddress: '0x000000000000000000000000000000000000dEaD',
            amount: BigInt(1),
        });

        if (result.success) {
            updateStatus(id, 'awaiting-signature');
        } else {
            updateStatus(id, 'failed', { errorMessage: result.revertReason });
        }
    }

    return (
        <button onClick={runSimulation} className="rounded bg-black px-3 py-1.5 text-sm text-white">
            Simulate real transfer (will revert — zero balance)
        </button>
    );
}
