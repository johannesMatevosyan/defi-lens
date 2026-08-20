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
        <div className="max-h-[500px] space-y-1 overflow-y-auto pr-1">
            {transactions.map((tx) => {
                const explorerUrl = tx.hash ? getExplorerTxUrl(tx.chainId, tx.hash) : null;

                return (
                    <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">{tx.description}</div>
                            {explorerUrl && (
                                <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                                    View on explorer
                                </a>
                            )}
                            {tx.status === 'failed' && tx.errorMessage && (
                                <div
                                    className="truncate text-xs text-red-600"
                                    title={tx.errorMessage}
                                >
                                    {tx.errorMessage}
                                </div>
                            )}
                        </div>
                        <div className="w-[25%] text-right">
                            <TransactionStatusBadge status={tx.status} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
