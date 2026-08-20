// src/components/ApprovalFlow.tsx
'use client';

import { useToastStore } from '@/lib/stores/toast-store';
import { useTransactionStore } from '@/lib/stores/transaction-store';
import { getAllowance } from '@/lib/transactions/allowance';
import { TRANSACTION_CHAIN_ID } from '@/lib/transactions/constants';
import { parseTransactionError } from '@/lib/transactions/parse-error';
import { useEffect, useState } from 'react';
import { erc20Abi, formatUnits, maxUint256 } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

interface ApprovalFlowProps {
  tokenAddress: `0x${string}`;
  tokenDecimals: number;
  tokenSymbol: string;
  spenderAddress: `0x${string}`;
  requiredAmount: bigint;
}

export function ApprovalFlow({
  tokenAddress,
  tokenDecimals,
  tokenSymbol,
  spenderAddress,
  requiredAmount,
}: ApprovalFlowProps) {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const startTransaction = useTransactionStore((state) => state.startTransaction);
    const updateStatus = useTransactionStore((state) => state.updateStatus);

    const [currentAllowance, setCurrentAllowance] = useState<bigint | null>(null);
    const [approvalMode, setApprovalMode] = useState<'exact' | 'infinite'>('exact');
    const [isApproving, setIsApproving] = useState(false);

    useEffect(() => {
        if (!address) return;
        getAllowance({ tokenAddress, ownerAddress: address, spenderAddress }).then(setCurrentAllowance);
    }, [address, tokenAddress, spenderAddress]);

    const hasSufficientAllowance = currentAllowance !== null && currentAllowance >= requiredAmount;
    const addToast = useToastStore((state) => state.addToast);

    async function handleApprove() {
        if (!address) return;
            setIsApproving(true);

            const amountToApprove = approvalMode === 'infinite' ? maxUint256 : requiredAmount;
            const id = startTransaction({
            chainId: TRANSACTION_CHAIN_ID,
            description: `Approve ${tokenSymbol} for spending`,
        });


        try {
            const hash = await writeContractAsync({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'approve',
                args: [spenderAddress, amountToApprove],
                chainId: TRANSACTION_CHAIN_ID
            });

            updateStatus(id, 'pending', { hash });

            const newAllowance = await getAllowance({ tokenAddress, ownerAddress: address, spenderAddress });
            setCurrentAllowance(newAllowance);
            updateStatus(id, 'confirmed');
        } catch (error) {
            const friendlyMessage = parseTransactionError(error);
            addToast(friendlyMessage, 'error');
            updateStatus(id, 'failed', { errorMessage: friendlyMessage });
        } finally {
            setIsApproving(false);
        }
    }

    if (currentAllowance === null) {
        return <p className="text-sm text-zinc-500">Checking current allowance…</p>;
    }

    if (hasSufficientAllowance) {
        return (
        <p className="text-sm text-green-700">
            ✓ Already approved ({formatUnits(currentAllowance, tokenDecimals)} {tokenSymbol})
        </p>
        );
    }

    return (
        <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm">
                This action needs permission to spend <strong>{formatUnits(requiredAmount, tokenDecimals)} {tokenSymbol}</strong> on
                your behalf.
            </p>

            <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                    <input
                        type="radio"
                        checked={approvalMode === 'exact'}
                        onChange={() => setApprovalMode('exact')}
                    />
                    Approve exact amount ({formatUnits(requiredAmount, tokenDecimals)} {tokenSymbol})
                </label>
                <label className="flex items-center gap-1.5">
                    <input
                        type="radio"
                        checked={approvalMode === 'infinite'}
                        onChange={() => setApprovalMode('infinite')}
                    />
                    Approve unlimited (fewer future approvals, higher risk)
                </label>
            </div>

            <button
                onClick={handleApprove}
                disabled={isApproving}
                className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
                {isApproving ? 'Approving…' : `Approve ${tokenSymbol}`}
            </button>
        </div>
    );
}
