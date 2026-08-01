// src/components/TransactionStatusBadge.tsx
import type { TransactionStatus } from '@/lib/stores/transaction-store';

const STATUS_CONFIG: Record<TransactionStatus, { label: string; className: string }> = {
    simulating: { label: 'Simulating…', className: 'bg-zinc-100 text-zinc-600' },
    'awaiting-signature': { label: 'Awaiting signature…', className: 'bg-amber-100 text-amber-700' },
    broadcasting: { label: 'Broadcasting…', className: 'bg-blue-100 text-blue-700' },
    pending: { label: 'Pending', className: 'bg-blue-100 text-blue-700' },
    confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-700' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
};

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
    const config = STATUS_CONFIG[status];
    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}
