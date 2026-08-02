// src/components/TransactionList.tsx
'use client';

import { getExplorerTxUrl } from '@/lib/explorer';
import { useTransactionStore } from '@/lib/stores/transaction-store';
import { TransactionStatusBadge } from './TransactionStatusBadge';

export function TransactionList() {
    const transactions = useTransactionStore((state) => state.transactions);

    if (transactions.length === 0) {
        return <p className="text-sm text-zinc-500">No transactions yet.</p>;
    }

    return (
        <div className="space-y-2">
            {transactions.map((tx) => {
                const explorerUrl = tx.hash ? getExplorerTxUrl(tx.chainId, tx.hash) : null;

                {tx.status === 'failed' && tx.errorMessage && (
                    <div className="text-xs text-red-600">{tx.errorMessage}</div>
                )}

                return (
                    <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <div className="text-sm font-medium">{tx.description}</div>
                            {explorerUrl && (
                                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                                    View on explorer
                                </a>
                            )}
                        </div>
                        <TransactionStatusBadge status={tx.status} />
                    </div>
                );
            })}
        </div>
    );
}
